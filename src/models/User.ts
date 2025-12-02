import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  CreatedAt,
} from 'sequelize-typescript';

export enum UserRole {
  OWNER = 'Owner',
  BUILDER = 'Builder',
}

@Table({
  tableName: 'User',
  timestamps: false, // We handle createdAt manually
})
export class User extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  address: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
  })
  role: UserRole;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  username?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  })
  email?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;
}
