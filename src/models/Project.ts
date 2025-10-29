import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { Project as IProject } from "../types";
import User from "./User";
import Step from "./Step";

// Define the attributes for creation (optional fields, id is auto-generated)
interface ProjectCreationAttributes
  extends Optional<IProject, "id" | "createdAt" | "updatedAt" | "progress"> {}

// Define the Project model class
class Project
  extends Model<IProject, ProjectCreationAttributes>
  implements IProject
{
  public id!: number;
  public name!: string;
  public slug!: string;
  public progress!: number;
  public description?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public owner!: string;
  public bank!: number;
  public logo?: string;
  public whitelist!: string[];
  public providerId?: string;
  public projectStatus!: 0 | 1 | 2 | 3; 
}

// Initialize the model
Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    progress: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    owner: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: User,
        key: "address",
      },
    },
    bank: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      defaultValue: 0,
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    projectStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isIn: [[0, 1, 2, 3]], // 0=unspecified, 1=pending, 2=approved, 3=rejected
      },
    },
    providerId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    whitelist: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: "[]",
      get() {
        return this.getDataValue("whitelist");
      },
      set(value: string[] | string) {
        // Stocke directement un array ou parse une string JSON
        if (Array.isArray(value)) {
          this.setDataValue("whitelist", value);
        } else if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            this.setDataValue("whitelist", Array.isArray(parsed) ? parsed : []);
          } catch {
            this.setDataValue("whitelist", []);
          }
        } else {
          this.setDataValue("whitelist", []);
        }
      },
    },
  },
  {
    sequelize,
    modelName: "Project",
    tableName: "Project",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default Project;
