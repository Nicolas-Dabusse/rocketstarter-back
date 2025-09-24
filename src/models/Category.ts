import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import { Category as ICategory } from '../types';

// Define the attributes for creation (no optional fields for Category)
interface CategoryCreationAttributes extends ICategory {}

// Define the Category model class
class Category extends Model<ICategory, CategoryCreationAttributes> implements ICategory {
  public id!: string;
  public name!: string;
}

// Initialize the model
Category.init(
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'Category',
    timestamps: false,
  }
);

export default Category;