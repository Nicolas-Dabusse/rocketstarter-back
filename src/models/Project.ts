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
    validate: {
      len: [3, 255],
    },
  })
  name: string;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      len: [3, 255],
      is: /^[a-z0-9-]+$/i, // Slug format: alphanumeric + hyphens
    },
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
    validate: {
      notEmpty: true,
    },
  })
  owner: string;

  @BelongsTo(() => User)
  ownerUser: User;

  // Bank as string to preserve DECIMAL precision (crypto amounts)
  @Default('0')
  @Column({
    type: DataType.DECIMAL(20, 8),
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  bank: string;

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

  // Whitelist: normalized to lowercase for Ethereum addresses
  @Default([])
  @Column({
    type: DataType.JSON,
    allowNull: false,
    get() {
      const raw = this.getDataValue('whitelist') as unknown;

      if (Array.isArray(raw)) {
        return raw.map((v) => String(v).toLowerCase());
      }

      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw) as unknown;
          return Array.isArray(parsed)
            ? parsed.map((v) => String(v).toLowerCase())
            : [];
        } catch {
          return [];
        }
      }

      return [];
    },
    set(value: string[] | string | null | undefined) {
      const toArray = (v: unknown): string[] => {
        if (Array.isArray(v)) return v.map((x) => String(x));
        if (typeof v === 'string') {
          try {
            const parsed = JSON.parse(v) as unknown;
            return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      const normalized = toArray(value).map((v) => v.toLowerCase());
      this.setDataValue('whitelist', normalized as any);
    },
  })
  whitelist: string[];
}
