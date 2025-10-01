import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import Task from './Task';

export interface RewardAttributes {
  id: string;
  type: string;
  value: string;
  contractAddress?: string;
  details?: string;
  taskId: string;
  createdAt?: Date;
}

interface RewardCreationAttributes extends Optional<RewardAttributes, 'id' | 'contractAddress' | 'details' | 'createdAt'> {}

class Reward extends Model<RewardAttributes, RewardCreationAttributes> implements RewardAttributes {
  public id!: string;
  public type!: string;
  public value!: string;
  public contractAddress?: string;
  public details?: string;
  public taskId!: string;
  public createdAt!: Date;
}

Reward.init(
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
      defaultValue: () => `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contractAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    taskId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: Task,
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Reward',
    tableName: 'Reward',
    timestamps: false,
  }
);

Task.hasMany(Reward, { foreignKey: 'taskId', as: 'rewards' });
Reward.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

export default Reward;
