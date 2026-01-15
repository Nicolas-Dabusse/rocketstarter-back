import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  AllowNull,
  Default,
} from 'sequelize-typescript';
import { Task } from './Task';

export enum RewardType {
  TOKEN = 'token',
  NFT = 'nft',
  REPUTATION = 'reputation',
  CUSTOM = 'custom',
}

@Table({
  tableName: 'Reward',
  timestamps: false,
})
export class Reward extends Model {
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
      isIn: [['token', 'nft', 'reputation', 'custom']],
    },
  })
  declare type: string;

  // Value as string to preserve precision (crypto amounts)
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  declare value: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
    validate: {
      // Validate Ethereum address format if provided
      is: /^(0x[a-fA-F0-9]{40})?$/,
    },
  })
  declare contractAddress?: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare details?: string;

  @ForeignKey(() => Task)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare taskId: number;

  @BelongsTo(() => Task)
  task: Task;

  // ==================== BLOCKCHAIN FIELDS ====================

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare onChain: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(66), // 0x + 64 hex chars
    validate: {
      is: /^(0x[a-fA-F0-9]{64})?$/,
    },
  })
  declare transactionHash?: string;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  declare blockNumber?: number;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
  })
  declare publishedAt?: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;
}
