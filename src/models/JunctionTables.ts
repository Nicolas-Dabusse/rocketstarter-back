import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

// Modèle pour la table de jointure ProjectCategory
class ProjectCategory extends Model {
  public projectId!: number;
  public categoryId!: number;
}

ProjectCategory.init(
  {
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: 'ProjectCategory',
    tableName: 'ProjectCategory',
    timestamps: false, // Pas de createdAt/updatedAt
  }
);

// Modèle pour la table de jointure TaskCategory
class TaskCategory extends Model {
  public taskId!: number;
  public categoryId!: number;
}

TaskCategory.init(
  {
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: 'TaskCategory',
    tableName: 'TaskCategory',
    timestamps: false, // Pas de createdAt/updatedAt
  }
);

export { ProjectCategory, TaskCategory };