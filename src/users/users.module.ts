import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../models/User';

@Module({
  imports: [
    // Enregistrer le modèle User pour l'injection
    SequelizeModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporter pour utiliser dans d'autres modules
})
export class UsersModule {}
