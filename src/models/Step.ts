import { DataTypes, Model, Optional, Transaction } from 'sequelize';
import { sequelize } from '../config/db';
import Project from './Project';
import Task from './Task';

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

   /**
   * Calculates and updates the progress of the step based on its associated tasks.
   * Progress is defined as the percentage of tasks with status 'done' (status = 3).
   * @param transaction - Optional transaction to use for the save operation
   */
  public async recalculateProgress(transaction?: Transaction): Promise<void> {
    const tasks = await Task.findAll({ 
      where: { stepId: this.id },
      transaction 
    });
    if (tasks.length === 0) {
      this.progress = 0;
    } else {
      const doneCount = tasks.filter(task => task.status === 3).length;
      this.progress = Number(((doneCount / tasks.length) * 100).toFixed(2));
    }
    await this.save({ transaction });
  }
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

export default Step;