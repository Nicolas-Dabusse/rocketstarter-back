import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import Task from './Task';

export interface RewardAttributes {
  id: number;
  type: string;
  value: string;
  contractAddress?: string;
  details?: string;
  taskId: number;
  createdAt?: Date;
}

interface RewardCreationAttributes extends Optional<RewardAttributes, 'id' | 'contractAddress' | 'details' | 'createdAt'> {}

class Reward extends Model<RewardAttributes, RewardCreationAttributes> implements RewardAttributes {
  public id!: number;
  public type!: string;
  public value!: string;
  public contractAddress?: string;
  public details?: string;
  public taskId!: number;
  public createdAt!: Date;
}

Reward.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
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
      type: DataTypes.INTEGER,
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
