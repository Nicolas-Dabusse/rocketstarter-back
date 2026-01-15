import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { PublishRewardDto } from './dto/publish-reward.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * RewardsController
 * Gestion des récompenses (rewards) des tâches
 *
 * Architecture:
 * - Draft (onChain=false): éditable par taskOwner
 * - Published (onChain=true): immuable, lecture seule
 */
@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  /**
   * POST /rewards
   * Créer une récompense en draft
   */
  @Post()
  create(@Body() createRewardDto: CreateRewardDto, @Request() req: any) {
    return this.rewardsService.create(createRewardDto, req.user.address);
  }

  /**
   * GET /rewards/task/:taskId
   * Récupérer toutes les récompenses d'une tâche
   */
  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string) {
    return this.rewardsService.findByTask(+taskId);
  }

  /**
   * GET /rewards/:id
   * Récupérer une récompense par son ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rewardsService.findOne(+id);
  }

  /**
   * PATCH /rewards/:id
   * Mettre à jour une récompense (uniquement si draft)
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRewardDto: UpdateRewardDto,
    @Request() req: any,
  ) {
    return this.rewardsService.update(+id, updateRewardDto, req.user.address);
  }

  /**
   * PATCH /rewards/:id/publish
   * Publier une récompense on-chain (la rend immuable)
   */
  @Patch(':id/publish')
  publish(
    @Param('id') id: string,
    @Body() publishRewardDto: PublishRewardDto,
    @Request() req: any,
  ) {
    return this.rewardsService.publish(+id, publishRewardDto, req.user.address);
  }

  /**
   * DELETE /rewards/:id
   * Supprimer une récompense (uniquement si draft)
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.rewardsService.remove(+id, req.user.address);
    return { message: 'Reward deleted successfully' };
  }
}
