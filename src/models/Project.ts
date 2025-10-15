import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import { Project as IProject } from '../types';
import User from './User';

// Define the attributes for creation (optional fields, id is auto-generated)
interface ProjectCreationAttributes extends Optional<IProject, 'id' | 'createdAt' | 'updatedAt' | 'progress'> {}

// Define the Project model class
class Project extends Model<IProject, ProjectCreationAttributes> implements IProject {
  public id!: number;
  public name!: string;
  public progress!: number;
  public description?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public owner!: string;
  public contractAddress?: string;
  public bank!: number;
  public whitelist!: string[];
  public twoCryptoId?: string;
}

// Initialize the model
Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    contractAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    bank: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      defaultValue: 0,
    },
    whitelist: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        return this.getDataValue('whitelist');
      },
      set(value: string) {
        // append to the whitelist
        const currentWhitelist = this.getDataValue('whitelist') || [];
        this.setDataValue('whitelist', [...currentWhitelist, value]);
      }
  }},
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