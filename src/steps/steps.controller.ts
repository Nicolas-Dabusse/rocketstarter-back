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
import { StepsService } from './steps.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('steps')
@UseGuards(JwtAuthGuard)
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Post()
  create(@Body() createStepDto: CreateStepDto, @Request() req: any) {
    return this.stepsService.create(createStepDto, req.user.address);
  }

  @Get()
  findAll() {
    return this.stepsService.findAll();
  }

  @Get('my')
  findMySteps(@Request() req: any) {
    return this.stepsService.findMySteps(req.user.address);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.stepsService.findByProject(+projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stepsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStepDto: UpdateStepDto,
    @Request() req: any,
  ) {
    return this.stepsService.update(+id, updateStepDto, req.user.address);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.stepsService.remove(+id, req.user.address);
    return { message: 'Step deleted successfully' };
  }
}
