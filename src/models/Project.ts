import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
  Default,
  AllowNull,
  Unique,
  HasMany,
  BeforeValidate,
  BeforeUpdate,
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import slugify from 'slugify';
import { User } from './User';
import { Category } from './Category';
import { ProjectCategory } from './ProjectCategory';
import { Step } from './Step';

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
  declare name: string;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      len: [3, 255],
      is: /^[a-z0-9-]+$/i, // Slug format: alphanumeric + hyphens
    },
  })
  declare slug: string;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  })
  declare progress: number;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare description?: string;

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
  declare owner: string;

  @BelongsTo(() => User, { as: 'ownerUser' })
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
  declare bank: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
  })
  declare logo?: string;

  @Default(ProjectStatus.UNSPECIFIED)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[0, 1, 2, 3]],
    },
  })
  declare projectStatus: ProjectStatus;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
  })
  declare providerId?: string;

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
  declare whitelist: string[];

  // Many-to-Many relation with Category
  @BelongsToMany(() => Category, () => ProjectCategory)
  categories: Category[];

  @HasMany(() => Step, { as: 'steps', foreignKey: 'projectId' })
  steps: Step[];

  // ==================== HOOKS ====================

  /**
   * HOOK: Generate slug before validation (for create and update)
   */
  @BeforeValidate
  static async generateSlugBeforeValidate(instance: Project) {
    // Utilise getDataValue pour accéder aux valeurs avec declare
    const name = instance.getDataValue('name');
    const slug = instance.getDataValue('slug');

    // Génère le slug si absent et qu'un nom est fourni
    if (!slug && name) {
      await Project.generateUniqueSlug(instance);
    }
  }

  /**
   * HOOK: Regenerate slug if name changes
   */
  @BeforeUpdate
  static async generateSlugOnUpdate(instance: Project) {
    if (instance.changed('name')) {
      await Project.generateUniqueSlug(instance);
    }
  }

  /**
   * Generate a unique slug for the project
   */
  private static async generateUniqueSlug(instance: Project) {
    const name = instance.getDataValue('name');

    if (!name) {
      throw new Error('Le nom du projet est requis pour générer un slug.');
    }

    // Note: Plusieurs projets peuvent avoir le même nom
    // Seul le slug doit être unique (géré automatiquement ci-dessous)

    // Génère un slug de base
    const baseSlug = slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
    let slug = baseSlug;
    let count = 1;

    // Cherche un slug unique
    while (true) {
      const existing = await Project.findOne({
        where: {
          slug: slug,
          id: { [Op.ne]: instance.getDataValue('id') || null },
        },
      });
      if (!existing) break;
      slug = `${baseSlug}-${count}`;
      count++;
    }

    instance.setDataValue('slug', slug);
  }
}
