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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * UsersController
 * Endpoints REST pour gérer les utilisateurs
 * Tous les endpoints sont protégés par JWT
 */
@Controller('users')
@UseGuards(JwtAuthGuard) // ← Toutes les routes nécessitent un JWT valide
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users
   * Créer un nouvel utilisateur
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * GET /users
   * Récupérer tous les utilisateurs
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * GET /users/me
   * Récupérer le profil de l'utilisateur connecté
   */
  @Get('me')
  getProfile(@Request() req: any) {
    // req.user.address vient du JWT (fourni par JwtStrategy)
    return this.usersService.findOne(req.user.address);
  }

  /**
   * GET /users/:address
   * Récupérer un utilisateur par son adresse
   */
  @Get(':address')
  findOne(@Param('address') address: string) {
    return this.usersService.findOne(address);
  }

  /**
   * PATCH /users/:address
   * Mettre à jour un utilisateur
   */
  @Patch(':address')
  update(
    @Param('address') address: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(address, updateUserDto);
  }

  /**
   * DELETE /users/:address
   * Supprimer un utilisateur
   */
  @Delete(':address')
  remove(@Param('address') address: string) {
    return this.usersService.remove(address);
  }
}
