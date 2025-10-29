/**
 * Centralise toutes les associations Sequelize pour éviter les imports circulaires.
 * À appeler depuis src/models/index.ts via setupAssociations().
 */

import User from "./User";
import Project from "./Project";
import Task from "./Task";
import Step from "./Step";
import Category from "./Category";
import Reward from "./Reward";

export default function setupAssociations(): void {
  // Step - Task
  Step.hasMany(Task, {
    foreignKey: "stepId",
    as: "tasks",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Task.belongsTo(Step, {
    foreignKey: "stepId",
    as: "step",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  // Project - Step
  Project.hasMany(Step, {
    foreignKey: "projectId",
    as: "steps",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Step.belongsTo(Project, {
    foreignKey: "projectId",
    as: "project",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Project - Task
  Project.hasMany(Task, {
    foreignKey: "projectId",
    as: "tasks",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Task.belongsTo(Project, {
    foreignKey: "projectId",
    as: "project",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // User - Project (owner)
  User.hasMany(Project, {
    foreignKey: "owner",
    as: "projects",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Project.belongsTo(User, {
    foreignKey: "owner",
    as: "ownerUser",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  // User - Task (builder & owner)
  User.hasMany(Task, {
    foreignKey: "builder",
    as: "assignedTasks",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Task.belongsTo(User, {
    foreignKey: "builder",
    as: "builderUser",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  User.hasMany(Task, {
    foreignKey: "taskOwner",
    as: "ownedTasks",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Task.belongsTo(User, {
    foreignKey: "taskOwner",
    as: "taskOwnerUser",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  // Task - Reward
  Task.hasMany(Reward, {
    foreignKey: "taskId",
    as: "rewards",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Reward.belongsTo(Task, {
    foreignKey: "taskId",
    as: "task",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // NOTE: belongsToMany (Category) is intentionally kept in src/models/index.ts
}
