import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { StepsModule } from './steps/steps.module';
import { CategoriesModule } from './categories/categories.module';
import { RewardsModule } from './rewards/rewards.module';

@Module({
  imports: [
    // Rate limiting global (protection DDoS)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Fenêtre de 60 secondes
        limit: 100, // Max 100 requêtes par IP par minute
      },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    StepsModule,
    CategoriesModule,
    RewardsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Appliquer le rate limiter globalement
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
