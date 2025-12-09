import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsToMany,
  Unique,
} from 'sequelize-typescript';
import { Task } from './Task';
import { TaskCategory } from './TaskCategory';

@Table({
  tableName: 'Category',
  timestamps: false, // Pas de createdAt/updatedAt pour les catégories
})
export class Category extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50],
    },
  })
  type: string;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      len: [2, 255],
    },
  })
  name: string;

  // Many-to-Many relation with Task
  @BelongsToMany(() => Task, () => TaskCategory)
  tasks: Task[];
}
