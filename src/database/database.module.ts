import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Step } from '../models/Step';
import { Category } from '../models/Category';
import { Reward } from '../models/Reward';
import { TaskCategory } from '../models/TaskCategory';
import { ProjectCategory } from '../models/ProjectCategory';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      // Logging conditionnel (dev only)
      logging: process.env.NODE_ENV === 'development' ? console.log : false,

      // Connection pool - Production-ready
      pool: {
        max: 20,
        min: 2,
        acquire: 60000,
        idle: 10000,
        evict: 1000,
      },

      // Retry logic (resilience)
      retry: {
        max: 3,
      },

      // PostgreSQL-specific optimizations
      dialectOptions: {
        connectTimeout: 60000,
        statement_timeout: 30000,
        idle_in_transaction_session_timeout: 60000,
      },

      // Performance: Enable query caching
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true,
      },

      // Register models
      models: [
        User,
        Project,
        Task,
        Step,
        Category,
        Reward,
        TaskCategory,
        ProjectCategory,
      ],

      // Sync database (dev only)
      autoLoadModels: true,
      synchronize: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}
