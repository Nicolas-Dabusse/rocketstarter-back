import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import { Category as ICategory } from '../types';

// Define the attributes for creation (id is auto-generated)
interface CategoryCreationAttributes extends Optional<ICategory, 'id'> {}

// Define the Category model class
class Category extends Model<ICategory, CategoryCreationAttributes> implements ICategory {
  public id!: number;
  public name!: string;
}

// Initialize the model
Category.init(
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