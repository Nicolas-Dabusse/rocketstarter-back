import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, ProjectsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
