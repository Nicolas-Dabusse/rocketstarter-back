import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import { Project as IProject } from '../types';
import User from './User';

// Define the attributes for creation (optional fields)
interface ProjectCreationAttributes extends Optional<IProject, 'createdAt' | 'updatedAt' | 'progress'> {}

// Define the Project model class
class Project extends Model<IProject, ProjectCreationAttributes> implements IProject {
  public id!: string;
  public name!: string;
  public progress!: number;
  public description?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public owner!: string;
}

// Initialize the model
Project.init(
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    progress: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    owner: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: User,
        key: 'address',
      },
    },
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'Project',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

// Define associations
Project.belongsTo(User, { foreignKey: 'owner', as: 'ownerUser' });
User.hasMany(Project, { foreignKey: 'owner', as: 'projects' });

export default Project;