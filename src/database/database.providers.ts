import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Step } from '../models/Step';
import { Category } from '../models/Category';
import { Reward } from '../models/Reward';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'rocket',
        password: process.env.DB_PASSWORD || 'secret_change_in_production',
        database: process.env.DB_NAME || 'rocketstarter',

        // Logging conditionnel (dev only)
        logging: process.env.NODE_ENV === 'development' ? console.log : false,

        // Connection pool - Production-ready
        pool: {
          max: 20, // Maximum connections
          min: 2, // Minimum connections (always warm)
          acquire: 60000, // 60s timeout to acquire connection
          idle: 10000, // 10s idle before release
          evict: 1000, // Check every 1s for idle connections
        },

        // Retry logic (resilience)
        retry: {
          max: 3, // 3 retries on connection failure
        },

        // PostgreSQL-specific optimizations
        dialectOptions: {
          connectTimeout: 60000, // Connection timeout
          statement_timeout: 30000, // Query timeout (30s)
          idle_in_transaction_session_timeout: 60000, // Transaction timeout
        },

        // Security: Disable query logging in production
        benchmark: process.env.NODE_ENV === 'development',

        // Performance: Enable query caching
        define: {
          timestamps: true, // createdAt, updatedAt
          underscored: false, // camelCase (not snake_case)
          freezeTableName: true, // Don't pluralize table names
        },
      });

      // Register models
      sequelize.addModels([User, Project, Task, Step, Category, Reward]);

      // Sync database (dev only - use migrations in prod)
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: false }); // Don't alter tables automatically
        console.log('✅ Database synced (development mode)');
      }

      return sequelize;
    },
  },
];
