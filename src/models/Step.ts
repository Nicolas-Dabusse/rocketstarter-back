import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import Project from './Project';

export interface StepAttributes {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StepCreationAttributes extends Optional<StepAttributes, 'id' | 'progress' | 'createdAt' | 'updatedAt' | 'description'> {}

class Step extends Model<StepAttributes, StepCreationAttributes> implements StepAttributes {
  public id!: number;
  public projectId!: number;
  public name!: string;
  public description?: string;
  public progress!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Step.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    progress: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
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
  },
  {
    sequelize,
    modelName: 'Step',
    tableName: 'Step',
    timestamps: true,
  }
);

// Define associations
Step.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

export default Step;