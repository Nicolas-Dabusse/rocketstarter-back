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
} from 'sequelize-typescript';
import { Task } from './Task';

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
  type: string;

  // Value as string to preserve precision (crypto amounts)
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  value: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
    validate: {
      // Validate Ethereum address format if provided
      is: /^(0x[a-fA-F0-9]{40})?$/,
    },
  })
  contractAddress?: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  details?: string;

  @ForeignKey(() => Task)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  taskId: number;

  @BelongsTo(() => Task)
  task: Task;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;
}
