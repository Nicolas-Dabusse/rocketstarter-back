import { Request, Response } from "express";
import { Project, User, Task } from "../models";
import { CreateProjectRequest, UpdateProjectRequest } from "../types";

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projectData: CreateProjectRequest = req.body;
    const whitelist = Array.isArray(projectData.whitelist)
      ? projectData.whitelist
      : [];
    const project = await Project.create({
      name: projectData.name,
      description: projectData.description,
      owner: projectData.owner,
      bank: projectData.bank ?? 0,
      whitelist,
      contractAddress: projectData.contractAddress,
      twoCryptoId: projectData.twoCryptoId,
    });
    res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getAllProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: "ownerUser",
          attributes: ["address", "username", "role"],
        },
        {
          model: Task,
          as: "tasks",
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getProjectById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: "Project ID is required",
      });
      return;
    }

    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: "Invalid project ID",
      });
      return;
    }

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "ownerUser",
          attributes: ["address", "username", "role"],
        },
        {
          model: Task,
          as: "tasks",
          include: [
            {
              model: User,
              as: "builderUser",
              attributes: ["address", "username"],
            },
          ],
        },
      ],
    });

    if (!project) {
      res.status(404).json({
        success: false,
        error: "Project not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateProjectRequest = req.body;
    if (!id) {
      res.status(400).json({ success: false, error: "Project ID is required" });
      return;
    }
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }
    // Préparer les données à mettre à jour
    const updateFields: any = { ...updateData };
    if (updateData.whitelist) {
      updateFields.whitelist = updateData.whitelist;
    }
    const [updatedRowsCount] = await Project.update(updateFields, {
      where: { id: projectId },
    });
    if (updatedRowsCount === 0) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }
    const updatedProject = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: "ownerUser",
          attributes: ["address", "username", "role"],
        },
      ],
    });
    res.status(200).json({
      success: true,
      data: updatedProject,
      message: "Project updated successfully",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userAddress = req.headers["x-user-address"] as string | undefined;

    if (!id) {
      res.status(400).json({
        success: false,
        error: "Project ID is required",
      });
      return;
    }

    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: "Invalid project ID",
      });
      return;
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }
    if (!userAddress || userAddress !== project.owner) {
      res.status(403).json({
        success: false,
        error: "Forbidden: only project owner can delete",
      });
      return;
    }
    await project.destroy();
    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const addToWhitelist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { address } = req.body; // New address to add

    if (!id || !address) {
      res
        .status(400)
        .json({ success: false, error: "Project ID and address are required" });
      return;
    }

    const project = await Project.findByPk(id);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    const ownerAddress = req.headers["x-user-address"] as string | undefined;
    if (!ownerAddress || ownerAddress !== project.owner) {
      res.status(403).json({
        success: false,
        error: "Forbidden: only project owner can modify whitelist",
      });
      return;
    }

    // Check if address is already in whitelist
    if (project.whitelist.includes(address)) {
      res
        .status(409)
        .json({ success: false, error: "Address already in whitelist" });
      return;
    }

    // Ajoute l’adresse et sauvegarde
    const whitelist = Array.isArray(project.whitelist) ? project.whitelist : [];
    await project.update({ whitelist: [...whitelist, address] });
    await project.save();
    await project.reload();

    res.status(200).json({
      success: true,
      data: project.whitelist,
      message: "Address added to whitelist",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const removeFromWhitelist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { address } = req.body; // Address to remove

    if (!id || !address) {
      res
        .status(400)
        .json({ success: false, error: "Project ID and address are required" });
      return;
    }

    const project = await Project.findByPk(id);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    const ownerAddress = req.headers["x-user-address"] as string | undefined;
    if (!ownerAddress || ownerAddress !== project.owner) {
      res.status(403).json({
        success: false,
        error: "Forbidden: only project owner can modify whitelist",
      });
      return;
    }

    const whitelist = Array.isArray(project.whitelist) ? project.whitelist : [];
    if (!whitelist.includes(address)) {
      res
        .status(404)
        .json({ success: false, error: "Address not found in whitelist" });
      return;
    }

    // Retire l'adresse et sauvegarde
    const updatedWhitelist = whitelist.filter((item) => item !== address);
    await project.update({ whitelist: updatedWhitelist });
    await project.save();
    await project.reload();

    res.status(200).json({
      success: true,
      data: project.whitelist,
      message: "Address removed from whitelist",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
