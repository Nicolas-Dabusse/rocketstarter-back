import {
  DataTypes,
  Model,
  Optional,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
} from "sequelize";
import type { Sequelize } from "sequelize";
import { sequelize } from "../config/db";
import { Task as ITask, TaskPriority, TaskStatus } from "../types";
import Project from "./Project";
import User from "./User";
import Category from "./Category";
import Step from "./Step";

// Define the attributes for creation (optional fields, id is auto-generated)
interface TaskCreationAttributes
  extends Optional<
    ITask,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "status"
    | "description"
    | "link"
    | "builder"
    | "effort"
    | "priority"
  > {}

// Define the Task model class
class Task extends Model<ITask, TaskCreationAttributes> implements ITask {
  public id!: number;
  public contractAddress?: string;
  public projectId!: number;
  public stepId?: number;
  public title!: string;
  public image?: string;
  public description?: string;
  public link?: string;
  public taskOwner?: string;
  public builder?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public effort?: number;
  public priority?: TaskPriority;
  public status!: TaskStatus;
  public claimedAt?: Date;
  public duration?: number;
  public dueDate?: Date;
  public dueDateStatus?: number;

  // Sequelize association mixins for Category
  public getCategories!: BelongsToManyGetAssociationsMixin<Category>;
  public addCategory!: BelongsToManyAddAssociationMixin<Category, number>;
  public removeCategory!: BelongsToManyRemoveAssociationMixin<Category, number>;
}

// Initialize the model
Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    contractAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Project,
        key: "id",
      },
    },
    stepId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Step,
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING(512),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    taskOwner: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: User,
        key: "address",
      },
    },
    builder: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: User,
        key: "address",
      },
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
    effort: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isIn: [[1, 2, 3, 5, 8, 13]],
      },
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 2 },
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // 0 = todo
      validate: { min: 0, max: 3 },
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dueDateStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 2 },
    },
    claimedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "Task",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    hooks: {
      // HOOK: Force status=0 and builder=null when creating a task
      beforeCreate: async (task) => {
        if (task.status !== 0) {
          task.status = 0;
        }
        if (task.builder) {
          task.builder = undefined;
        }
      },

      // HOOK: Validate business rules before any update
      beforeUpdate: async (task) => {
        // RULE: Tasks with status=0 (todo) cannot have a builder assigned
        if (task.status === 0 && task.builder) {
          throw new Error(
            "Business rule violation: Task with status=0 (todo) cannot have a builder assigned"
          );
        }

        // RULE: Prevent skipping review process (1 → 3 forbidden)
        if (task.changed("status")) {
          const oldStatus = task.previous("status") as number;
          const newStatus = task.status;

          if (oldStatus === 1 && newStatus === 3) {
            throw new Error(
              "Business rule violation: Cannot skip review process - task must go from in-progress (1) to review (2) first"
            );
          }
        }
      },

      // HOOK: After saving a task, recalculate the progress of the associated step
      afterSave: async (task, options) => {
        if (task.stepId) {
          const step = await Step.findByPk(task.stepId, { transaction: options.transaction });
          if (step) {
            await step.recalculateProgress(options.transaction || undefined);
          }
        }
      },
    },
  }
);

export default Task;
