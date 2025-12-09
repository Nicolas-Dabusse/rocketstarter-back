import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { Project } from './Project';
import { Category } from './Category';

/**
 * Table de jointure Many-to-Many: Project ↔ Category
 * Un projet peut avoir plusieurs catégories (ex: "DeFi", "Gaming", "NFT")
 * Une catégorie peut être assignée à plusieurs projets
 */
@Table({
  tableName: 'ProjectCategory',
  timestamps: false, // Pas de createdAt/updatedAt pour les tables de jointure
})
export class ProjectCategory extends Model {
  @ForeignKey(() => Project)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  projectId: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  categoryId: number;
}
