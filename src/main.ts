import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix pour toutes les routes (sauf /health)
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // Validation globale avec class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
