import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../models/User';

/**
 * DTO pour mettre à jour un utilisateur
 * Tous les champs sont optionnels
 */
export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  pseudo?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
