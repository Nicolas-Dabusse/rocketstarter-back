import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../models/User';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

/**
 * DTO pour mettre à jour un utilisateur
 * Tous les champs sont optionnels
 */
export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @Sanitize()
  @IsString()
  @IsOptional()
  username?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
