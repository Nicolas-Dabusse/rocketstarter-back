import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { Task } from './Task';
import { Project } from './Project';
import { Category } from './Category';

/**
 * Table de jointure: Task ↔ Category
 */
@Table({
  tableName: 'TaskCategory',
  timestamps: false,
})
export class TaskCategory extends Model {
  @ForeignKey(() => Task)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  taskId: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  categoryId: number;
}

/**
 * Table de jointure: Project ↔ Category
 */
@Table({
  tableName: 'ProjectCategory',
  timestamps: false,
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
