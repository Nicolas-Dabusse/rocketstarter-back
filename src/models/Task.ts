import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import { Task as ITask, TaskPriority, TaskStatus } from '../types';
import Project from './Project';
import User from './User';

// Define the attributes for creation (optional fields)
interface TaskCreationAttributes extends Optional<ITask, 'createdAt' | 'updatedAt' | 'status' | 'description' | 'link' | 'builder' | 'effort' | 'priority'> {}

// Define the Task model class
class Task extends Model<ITask, TaskCreationAttributes> implements ITask {
  public id!: string;
  public projectId!: string;
  public title!: string;
  public description?: string;
  public link?: string;
  public builder?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public effort?: string;
  public priority?: TaskPriority;
  public status!: TaskStatus;
}

// Initialize the model
Task.init(
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.STRING(255),
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
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('todo', 'inprogress', 'done'),
      allowNull: false,
      defaultValue: 'todo',
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