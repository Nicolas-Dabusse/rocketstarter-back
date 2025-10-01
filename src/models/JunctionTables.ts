import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

// Modèle pour la table de jointure ProjectCategory
class ProjectCategory extends Model {
  public projectId!: string;
  public categoryId!: string;
}

ProjectCategory.init(
  {
    projectId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.STRING(255),
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
  public taskId!: string;
  public categoryId!: string;
}

TaskCategory.init(
  {
    taskId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.STRING(255),
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