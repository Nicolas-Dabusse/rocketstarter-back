import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../models/User';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

/**
 * DTO pour créer un nouvel utilisateur
 */
export class CreateUserDto {
  @IsString()
  address: string; // Adresse Ethereum (sera normalisée en lowercase)

  @IsEmail()
  @IsOptional()
  email?: string;

  @Sanitize()
  @IsString()
  @IsOptional()
  username?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole; // Par défaut: Builder
}
