import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  Default,
  AllowNull,
  Unique,
} from 'sequelize-typescript';
import { User } from './User';

export enum ProjectStatus {
  UNSPECIFIED = 0,
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

@Table({
  tableName: 'Project',
  timestamps: true,
})
export class Project extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name: string;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  slug: string;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  })
  progress: number;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  description?: string;

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

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  owner: string;

  @BelongsTo(() => User)
  ownerUser: User;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(20, 8),
    allowNull: false,
  })
  bank: number;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
  })
  logo?: string;

  @Default(ProjectStatus.UNSPECIFIED)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[0, 1, 2, 3]],
    },
  })
  projectStatus: ProjectStatus;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
  })
  providerId?: string;

  @Default([])
  @Column({
    type: DataType.JSON,
    allowNull: false,
    get() {
      const value = this.getDataValue('whitelist') as string[] | null;
      return value || [];
    },
    set(value: string[] | string) {
      if (Array.isArray(value)) {
        this.setDataValue('whitelist', value);
      } else if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value) as unknown;
          this.setDataValue('whitelist', Array.isArray(parsed) ? parsed : []);
        } catch {
          this.setDataValue('whitelist', []);
        }
      } else {
        this.setDataValue('whitelist', []);
      }
    },
  })
  whitelist: string[];
}
