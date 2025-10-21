import { Request, Response } from 'express';
import { Task, Project } from '../models';
import { UpdateTaskRequest } from '../types';

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateTaskRequest = req.body;
    
    if (!id) {
      res.status(400).json({ success: false, error: 'Task ID is required' });
      return;
    }
    
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ success: false, error: 'Invalid task ID' });
      return;
    }
    
    const task = await Task.findByPk(taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    
    const project = await Project.findByPk(task.projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    
    const userAddress = req.headers['x-user-address'] as string | undefined;
    if (!userAddress) {
      res.status(401).json({ success: false, error: 'User address required' });
      return;
    }


    // Status transitions: 0=todo, 1=inprogress, 2=inreview, 3=done
    const currentStatus = task.status;
    const newStatus = updateData.status;
    const currentBuilder = task.builder;
    const isOwner = userAddress === project.owner;
    const isTaskOwner = userAddress === task.taskOwner;
    const isAssignedBuilder = userAddress === currentBuilder;
    
    // CONSISTENCY FIX: Tasks with status=0 should always have builder=null
    const isTaskFree = currentStatus === 0 || !currentBuilder;
    
    // AUTO-FIX: If task is status=0 but has a builder, clean it up
    if (currentStatus === 0 && currentBuilder) {
      await task.update({ builder: undefined });
      task.builder = undefined; // Update local object
    }

    // RULE 1: Builder claims free task (0 → 1)
    if (currentStatus === 0 && newStatus === 1) {
      const now = new Date();
      await task.update({ builder: userAddress, status: 1, claimedAt: now });
      res.status(200).json({ success: true, data: task, message: 'Task claimed by builder' });
      return;
    }

    // RULE 2: Builder releases their task (1 → 0)  
    if (currentStatus === 1 && isAssignedBuilder && newStatus === 0) {
      await task.update({ builder: undefined, status: 0 });
      res.status(200).json({ success: true, data: task, message: 'Task released back to todo' });
      return;
    }

    // RULE 3: Builder sends to review (1 → 2)
    if (currentStatus === 1 && isAssignedBuilder && newStatus === 2) {
      await task.update({ status: 2 });
      res.status(200).json({ success: true, data: task, message: 'Task sent to review' });
      return;
    }

    // RULE 4: Builder takes back from review (2 → 1) 
    if (currentStatus === 2 && isAssignedBuilder && newStatus === 1) {
      await task.update({ status: 1 });
      res.status(200).json({ success: true, data: task, message: 'Task back to in progress' });
      return;
    }

    // RULE 5: Builder releases from review back to todo (2 → 0) 
    if (currentStatus === 2 && isAssignedBuilder && newStatus === 0) {
      await task.update({ builder: undefined, status: 0 });
      res.status(200).json({ success: true, data: task, message: 'Task released from review to todo' });
      return;
    }

    // RULE 6: Owner or TaskOwner validates task (2 → 3) WITHOUT taking ownership
    if (currentStatus === 2 && (isOwner || isTaskOwner) && newStatus === 3) {
      // Validation without changing builder - rewards stay with original builder
      let durationHours = task.duration;
      if (task.claimedAt) {
        const start = new Date(task.claimedAt).getTime();
        const diffMs = Date.now() - start;
        durationHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60))); // heures arrondies
      }
      await task.update({ status: 3, duration: durationHours });
      res.status(200).json({ success: true, data: task, message: 'Task validated' });
      return;
    }

    // RULE 7: Owner or TaskOwner rejects (2 → 1) 
    if (currentStatus === 2 && (isOwner || isTaskOwner) && newStatus === 1) {
      await task.update({ status: 1 });
      res.status(200).json({ success: true, data: task, message: 'Task rejected, back to in progress' });
      return;
    }

    // LOCK PROTECTION: Status 2 tasks are LOCKED to their assigned builder
    // No one else can claim or reassign them, not even the owner or taskOwner
    if (currentStatus === 2 && !isAssignedBuilder && !isOwner && !isTaskOwner) {
      res.status(403).json({ 
        success: false, 
        error: 'Task in review is locked to assigned builder' 
      });
      return;
    }

    // LOCK PROTECTION: Even owner/taskOwner cannot reassign while task is in review (status 2)
    if (currentStatus === 2 && (isOwner || isTaskOwner) && (newStatus === 2 || updateData.builder !== undefined)) {
      res.status(403).json({ 
        success: false, 
        error: 'Cannot reassign task while in review - must validate (2→3) or reject (2→1) first' 
      });
      return;
    }

    // RULE 8: Owner or TaskOwner resets finished task (3 → 0)
    if (currentStatus === 3 && (isOwner || isTaskOwner) && newStatus === 0) {
      await task.update({ builder: undefined, status: 0 });
      res.status(200).json({ success: true, data: task, message: 'Task reset to todo' });
      return;
    }

    // RULE 9: Owner or TaskOwner manually reassigns builder (only if NOT in review)
    if ((isOwner || isTaskOwner) && updateData.builder !== undefined && currentStatus !== 2) {
      await task.update({ builder: updateData.builder || undefined });
      res.status(200).json({ success: true, data: task, message: 'Task builder updated' });
      return;
    }

    // PROTECTION: Owner/TaskOwner cannot skip workflow - no direct 1→3 (must go through review)
    if ((isOwner || isTaskOwner) && currentStatus === 1 && newStatus === 3) {
      res.status(403).json({ 
        success: false, 
        error: 'Cannot skip review process - task must go from in-progress (1) to review (2) first' 
      });
      return;
    }

    // RULE 10: Owner or TaskOwner can force any other status change (admin override, except forbidden transitions)
    if ((isOwner || isTaskOwner) && newStatus !== undefined && newStatus !== currentStatus && 
        currentStatus !== 2 && !(currentStatus === 1 && newStatus === 3)) {
      const updateObj: any = { status: newStatus };
      
      // Auto-cleanup: If setting to status=0, remove builder
      if (newStatus === 0) {
        updateObj.builder = undefined;
      }
      
      await task.update(updateObj);
      res.status(200).json({ success: true, data: task, message: 'Task status updated' });
      return;
    }

    // RULE 11: Content updates (title, description, etc.) - Owner, TaskOwner, or assigned builder
    if (isOwner || isTaskOwner || isAssignedBuilder) {
      const { status: _, builder: __, ...contentUpdates } = updateData;
      if (Object.keys(contentUpdates).length > 0) {
        await task.update(contentUpdates);
        res.status(200).json({ success: true, data: task, message: 'Task content updated' });
        return;
      }
    }
    

    // Unauthorized action
    res.status(403).json({ 
      success: false, 
      error: 'Forbidden: workflow rule violation or unauthorized' 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};