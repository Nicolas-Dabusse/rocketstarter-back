import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import { User as IUser } from '../types';

// Define the attributes for creation (optional fields)
interface UserCreationAttributes extends Optional<IUser, 'createdAt'> {}

// Define the User model class
class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public address!: string;
  public role!: 'Owner' | 'Builder';
  public username?: string;
  public email?: string;
  public createdAt!: Date;
}

// Initialize the model
User.init(
  {
    address: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('Owner', 'Builder'),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'User',
    timestamps: false, // We handle createdAt manually
  }
);

export default User;