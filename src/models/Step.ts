import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { Project } from './Project';
import { Task, TaskStatus } from './Task';

@Table({
  tableName: 'Step',
  timestamps: true,
})
export class Step extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  projectId: number;

  @BelongsTo(() => Project)
  project: Project;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      len: [3, 255],
    },
  })
  name: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  description?: string;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  })
  progress: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;

  // Relation: Un Step a plusieurs Tasks
  @HasMany(() => Task)
  tasks: Task[];

  /**
   * Calculates and updates the progress of the step based on its associated tasks.
   * Progress is defined as the percentage of tasks with status 'DONE' (status = 3).
   *
   * Formula: (tasks DONE / total tasks) * 100
   *
   * @param transaction - Optional transaction to use for the save operation
   * @returns Promise<void>
   *
   * @example
   * await step.recalculateProgress();
   * console.log(step.progress); // 75.00
   */
  async recalculateProgress(transaction?: Transaction): Promise<void> {
    const tasks = await Task.findAll({
      where: { stepId: this.id },
      transaction,
    });

    if (tasks.length === 0) {
      this.progress = 0;
    } else {
      const doneCount = tasks.filter(
        (task) => task.status === TaskStatus.DONE,
      ).length;
      this.progress = Number(((doneCount / tasks.length) * 100).toFixed(2));
    }

    await this.save({ transaction });
  }
}
