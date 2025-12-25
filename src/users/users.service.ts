import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/User';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * UsersService
 * Gère la logique métier des utilisateurs
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User, // ← Repository Sequelize injecté automatiquement !
  ) {}

  /**
   * Créer un nouvel utilisateur
   * @param createUserDto - Données du user à créer
   * @returns User créé
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Normaliser l'adresse en lowercase (comme dans le modèle)
      const address = createUserDto.address.toLowerCase();

      return await this.userModel.create({
        address,
        email: createUserDto.email,
        username: createUserDto.username,
        role: createUserDto.role || 'Builder', // Par défaut: Builder
      });
    } catch (error: any) {
      // Si l'adresse existe déjà (PRIMARY KEY violation)
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('User with this address already exists');
      }
      throw error;
    }
  }

  /**
   * Récupérer tous les utilisateurs
   * @returns Liste de tous les users
   */
  async findAll(): Promise<User[]> {
    return await this.userModel.findAll({
      order: [['createdAt', 'DESC']], // Plus récents en premier
    });
  }

  /**
   * Récupérer un utilisateur par son adresse
   * @param address - Adresse Ethereum
   * @returns User trouvé
   */
  async findOne(address: string): Promise<User> {
    const user = await this.userModel.findByPk(address.toLowerCase());

    if (!user) {
      throw new NotFoundException(`User with address ${address} not found`);
    }

    return user;
  }

  /**
   * Mettre à jour un utilisateur
   * @param address - Adresse Ethereum
   * @param updateUserDto - Données à mettre à jour
   * @returns User mis à jour
   */
  async update(address: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(address); // Lève une erreur si non trouvé

    await user.update(updateUserDto);

    return user;
  }

  /**
   * Supprimer un utilisateur
   * @param address - Adresse Ethereum
   */
  async remove(address: string): Promise<void> {
    const user = await this.findOne(address); // Lève une erreur si non trouvé

    await user.destroy();
  }

  /**
   * Créer un user s'il n'existe pas, ou le récupérer s'il existe
   * Utile pour l'auto-création lors de la première connexion
   * @param address - Adresse Ethereum
   * @returns User (nouveau ou existant)
   */
  async findOrCreate(address: string): Promise<User> {
    const [user] = await this.userModel.findOrCreate({
      where: { address: address.toLowerCase() },
      defaults: {
        address: address.toLowerCase(),
        role: 'Builder',
      },
    });

    return user;
  }
}
