import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../models/User';

/**
 * DTO pour créer un nouvel utilisateur
 */
export class CreateUserDto {
  @IsString()
  address: string; // Adresse Ethereum (sera normalisée en lowercase)

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  pseudo?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole; // Par défaut: Builder
}
