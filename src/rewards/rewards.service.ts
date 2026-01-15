import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Reward } from '../models/Reward';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { PublishRewardDto } from './dto/publish-reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward)
    private rewardModel: typeof Reward,
    @InjectModel(Task)
    private taskModel: typeof Task,
    @InjectModel(Project)
    private projectModel: typeof Project,
  ) {}

  /**
   * Créer une récompense (draft)
   * Seul le taskOwner peut créer des rewards pour sa tâche
   */
  async create(
    createRewardDto: CreateRewardDto,
    userAddress: string,
  ): Promise<Reward> {
    // Vérifier que la tâche existe et récupérer le taskOwner
    const task = await this.taskModel.findByPk(createRewardDto.taskId);
    if (!task) {
      throw new NotFoundException(
        `Task with ID ${createRewardDto.taskId} not found`,
      );
    }

    // Vérifier que l'utilisateur est le taskOwner
    if (task.taskOwner?.toLowerCase() !== userAddress.toLowerCase()) {
      throw new ForbiddenException(
        'Only the task owner can create rewards for this task',
      );
    }

    // Créer la récompense en draft (onChain=false par défaut)
    const reward = await this.rewardModel.create({
      type: createRewardDto.type,
      value: createRewardDto.value,
      contractAddress: createRewardDto.contractAddress,
      details: createRewardDto.details,
      taskId: createRewardDto.taskId,
      onChain: false, // Draft par défaut
    });

    return reward;
  }

  /**
   * Récupérer toutes les récompenses d'une tâche
   */
  async findByTask(taskId: number): Promise<Reward[]> {
    const task = await this.taskModel.findByPk(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return await this.rewardModel.findAll({
      where: { taskId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Récupérer une récompense par son ID
   */
  async findOne(id: number): Promise<Reward> {
    const reward = await this.rewardModel.findByPk(id, {
      include: [{ model: Task, as: 'task' }],
    });

    if (!reward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }

    return reward;
  }

  /**
   * Mettre à jour une récompense
   * Seul le taskOwner peut modifier, et uniquement si la reward est en draft
   * ET si la task n'a pas encore été claimée (status = 0)
   */
  async update(
    id: number,
    updateRewardDto: UpdateRewardDto,
    userAddress: string,
  ): Promise<Reward> {
    const reward = await this.findOne(id);

    // Vérifier si la reward est publiée on-chain
    if (reward.onChain) {
      throw new ForbiddenException(
        'Cannot modify reward: already published on-chain (immutable)',
      );
    }

    // Récupérer la tâche pour vérifier le taskOwner et le status
    const task = await this.taskModel.findByPk(reward.taskId);
    if (!task) {
      throw new NotFoundException('Associated task not found');
    }

    // Vérifier que l'utilisateur est le taskOwner
    if (task.taskOwner?.toLowerCase() !== userAddress.toLowerCase()) {
      throw new ForbiddenException(
        'Only the task owner can modify this reward',
      );
    }

    // Vérifier que la task n'a pas été claimée (status = 0 = TODO)
    if (task.status !== 0) {
      throw new ForbiddenException(
        'Cannot modify reward: task has been claimed (status must be TODO)',
      );
    }

    // Mettre à jour
    await reward.update(updateRewardDto);
    return reward;
  }

  /**
   * Publier une récompense on-chain
   * Marque la reward comme immuable après publication blockchain
   */
  async publish(
    id: number,
    publishRewardDto: PublishRewardDto,
    userAddress: string,
  ): Promise<Reward> {
    const reward = await this.findOne(id);

    // Vérifier si déjà publiée
    if (reward.onChain) {
      throw new BadRequestException('Reward is already published on-chain');
    }

    // Récupérer la tâche pour vérifier le taskOwner
    const task = await this.taskModel.findByPk(reward.taskId);
    if (!task) {
      throw new NotFoundException('Associated task not found');
    }

    // Vérifier que l'utilisateur est le taskOwner
    if (task.taskOwner?.toLowerCase() !== userAddress.toLowerCase()) {
      throw new ForbiddenException(
        'Only the task owner can publish this reward',
      );
    }

    // Marquer comme publié on-chain
    await reward.update({
      onChain: true,
      transactionHash: publishRewardDto.transactionHash,
      blockNumber: publishRewardDto.blockNumber,
      publishedAt: publishRewardDto.publishedAt || new Date(),
    });

    return reward;
  }

  /**
   * Supprimer une récompense
   * Seul le taskOwner peut supprimer, et uniquement si en draft
   * ET si la task n'a pas encore été claimée (status = 0)
   */
  async remove(id: number, userAddress: string): Promise<void> {
    const reward = await this.findOne(id);

    // Vérifier si la reward est publiée on-chain
    if (reward.onChain) {
      throw new ForbiddenException(
        'Cannot delete reward: already published on-chain (immutable)',
      );
    }

    // Récupérer la tâche pour vérifier le taskOwner et le status
    const task = await this.taskModel.findByPk(reward.taskId);
    if (!task) {
      throw new NotFoundException('Associated task not found');
    }

    // Vérifier que l'utilisateur est le taskOwner
    if (task.taskOwner?.toLowerCase() !== userAddress.toLowerCase()) {
      throw new ForbiddenException(
        'Only the task owner can delete this reward',
      );
    }

    // Vérifier que la task n'a pas été claimée (status = 0 = TODO)
    if (task.status !== 0) {
      throw new ForbiddenException(
        'Cannot delete reward: task has been claimed (status must be TODO)',
      );
    }

    await reward.destroy();
  }

  /**
   * Synchroniser les rewards depuis la blockchain (pour plus tard)
   * Cette méthode sera appelée par un indexer/listener blockchain
   */
  async syncFromBlockchain(
    taskId: number,
    blockchainRewards: Array<{
      type: string;
      value: string;
      contractAddress?: string;
      transactionHash: string;
      blockNumber: number;
    }>,
  ): Promise<Reward[]> {
    // TODO: Implémenter la synchronisation depuis la blockchain
    // Pour l'instant, méthode placeholder
    throw new Error('Blockchain sync not implemented yet');
  }
}
