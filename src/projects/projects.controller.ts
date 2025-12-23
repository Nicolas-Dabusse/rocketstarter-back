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
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.address);
  }

  @Get()
  async findAll() {
    return this.projectsService.findAll();
  }

  /**
   * IMPORTANT: Cette route doit être AVANT @Get(':id')
   * Sinon NestJS interprète "owner" comme un id
   */
  @Get('owner/:ownerId')
  async findByOwner(@Param('ownerId') ownerId: string) {
    return this.projectsService.findByOwner(ownerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.address);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.remove(id, req.user.address);
  }

  /**
   * PATCH /projects/:id/whitelist/add
   * Ajouter une adresse à la whitelist du projet
   */
  @Patch(':id/whitelist/add')
  async addToWhitelist(
    @Param('id') id: string,
    @Body('address') address: string,
    @Request() req: any,
  ) {
    const project = await this.projectsService.findOne(id);

    // Vérifier ownership
    if (project.owner !== req.user.address.toLowerCase()) {
      throw new ForbiddenException('You are not the owner of this project');
    }

    // Vérifier si l'adresse est déjà dans la whitelist
    if (project.whitelist.includes(address.toLowerCase())) {
      throw new ConflictException('Address already in whitelist');
    }

    // Ajouter l'adresse
    const updatedWhitelist = [...project.whitelist, address.toLowerCase()];
    return this.projectsService.update(
      id,
      { whitelist: updatedWhitelist },
      req.user.address,
    );
  }

  /**
   * PATCH /projects/:id/whitelist/remove
   * Retirer une adresse de la whitelist du projet
   */
  @Patch(':id/whitelist/remove')
  async removeFromWhitelist(
    @Param('id') id: string,
    @Body('address') address: string,
    @Request() req: any,
  ) {
    const project = await this.projectsService.findOne(id);

    // Vérifier ownership
    if (project.owner !== req.user.address.toLowerCase()) {
      throw new ForbiddenException('You are not the owner of this project');
    }

    // Vérifier si l'adresse est dans la whitelist
    if (!project.whitelist.includes(address.toLowerCase())) {
      throw new NotFoundException('Address not found in whitelist');
    }

    // Retirer l'adresse
    const updatedWhitelist = project.whitelist.filter(
      (item) => item !== address.toLowerCase(),
    );
    return this.projectsService.update(
      id,
      { whitelist: updatedWhitelist },
      req.user.address,
    );
  }
}
