import { DataTypes, Model, Optional, BelongsToManyGetAssociationsMixin, BelongsToManyAddAssociationMixin, BelongsToManyRemoveAssociationMixin } from 'sequelize';
import type { Sequelize } from 'sequelize';
import { sequelize } from '../config/db';
import { Task as ITask, TaskPriority, TaskStatus } from '../types';
import Project from './Project';
import User from './User';
import Category from './Category';

// Define the attributes for creation (optional fields, id is auto-generated)
interface TaskCreationAttributes extends Optional<ITask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'description' | 'link' | 'builder' | 'effort' | 'priority'> {}

// Define the Task model class
class Task extends Model<ITask, TaskCreationAttributes> implements ITask {
  public id!: number;
  public projectId!: number;
  public title!: string;
  public description?: string;
  public link?: string;
  public builder?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public effort?: string;
  public priority?: TaskPriority;
  public status!: TaskStatus;

  // Sequelize association mixins for Category
  public getCategories!: BelongsToManyGetAssociationsMixin<Category>;
  public addCategory!: BelongsToManyAddAssociationMixin<Category, number>;
  public removeCategory!: BelongsToManyRemoveAssociationMixin<Category, number>;
}

// Initialize the model
Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Project,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING(512),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    builder: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: User,
        key: 'address',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    effort: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 2 },
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // 0 = todo
      validate: { min: 0, max: 3 },
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'Task',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

// Define associations
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Task.belongsTo(User, { foreignKey: 'builder', as: 'builderUser' });

Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
User.hasMany(Task, { foreignKey: 'builder', as: 'assignedTasks' });

export default Task;