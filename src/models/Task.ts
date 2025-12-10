import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasMany,
  CreatedAt,
  UpdatedAt,
  Default,
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
  AfterSave,
} from 'sequelize-typescript';
import { Project } from './Project';
import { Step } from './Step';
import { User } from './User';
import { Category } from './Category';
import { TaskCategory } from './TaskCategory';
import { Reward } from './Reward';

export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  IN_REVIEW = 2,
  DONE = 3,
}

export enum TaskPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export enum DueDateStatus {
  ON_TIME = 0,
  WARNING = 1,
  OVERDUE = 2,
}

@Table({
  tableName: 'Task',
  timestamps: true,
})
export class Task extends Model {
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

  @ForeignKey(() => Step)
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  stepId?: number;

  @BelongsTo(() => Step)
  step?: Step;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      len: [3, 255],
    },
  })
  title: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(512),
  })
  image?: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  description?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(512),
  })
  link?: string;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
  })
  taskOwner?: string;

  @BelongsTo(() => User, 'taskOwner')
  ownerUser?: User;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
  })
  builder?: string;

  @BelongsTo(() => User, 'builder')
  builderUser?: User;

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

  // Effort using Fibonacci sequence (agile story points)
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
    validate: {
      isIn: [[1, 2, 3, 5, 8, 13]],
    },
  })
  effort?: number;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
    validate: {
      min: 0,
      max: 2,
    },
  })
  priority?: TaskPriority;

  @Default(TaskStatus.TODO)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 3,
    },
  })
  status: TaskStatus;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
  })
  dueDate?: Date;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
    validate: {
      min: 0,
      max: 2,
    },
  })
  dueDateStatus?: DueDateStatus;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
  })
  claimedAt?: Date;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  duration?: number;

  // Many-to-Many relation with Category
  @BelongsToMany(() => Category, () => TaskCategory)
  categories: Category[];

  // One-to-Many relation with Reward
  @HasMany(() => Reward)
  rewards: Reward[];

  // ==================== HOOKS ====================

  /**
   * HOOK: Force status=TODO and clear builder when creating a task
   */
  @BeforeCreate
  static enforceInitialState(task: Task) {
    if (task.status !== TaskStatus.TODO) {
      task.status = TaskStatus.TODO;
    }
    if (task.builder) {
      task.builder = undefined;
    }
  }

  /**
   * HOOK: Validate business rules before updating a task
   */
  @BeforeUpdate
  static validateBusinessRules(task: Task) {
    // RULE: Tasks with status=TODO cannot have a builder assigned
    const builderIsBeingCleared =
      task.changed('builder') &&
      (task.builder === null || task.builder === undefined);
    const statusIsChangingToTodo =
      task.changed('status') && task.status === TaskStatus.TODO;

    if (
      task.status === TaskStatus.TODO &&
      task.builder &&
      !builderIsBeingCleared &&
      !statusIsChangingToTodo
    ) {
      throw new Error(
        'Business rule violation: Task with status=TODO cannot have a builder assigned',
      );
    }

    // RULE: Prevent skipping review process (IN_PROGRESS → DONE forbidden)
    if (task.changed('status')) {
      const oldStatus = task.previous('status') as TaskStatus;
      const newStatus = task.status;

      if (
        oldStatus === TaskStatus.IN_PROGRESS &&
        newStatus === TaskStatus.DONE
      ) {
        throw new Error(
          'Business rule violation: Cannot skip review process - task must go from IN_PROGRESS to IN_REVIEW first',
        );
      }
    }
  }

  /**
   * HOOK: Recalculate step progress after saving a task
   */
  @AfterSave
  static async recalculateStepProgress(
    task: Task,
    options: { transaction?: any },
  ) {
    if (task.stepId) {
      const step = await Step.findByPk(task.stepId, {
        transaction: options.transaction,
      });
      if (step && typeof step.recalculateProgress === 'function') {
        await step.recalculateProgress(options.transaction);
      }
    }
  }
}
