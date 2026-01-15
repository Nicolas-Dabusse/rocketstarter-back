import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet - Headers de sécurité HTTP
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production', // CSP en prod
      crossOriginEmbedderPolicy: false, // Désactivé pour compatibilité CORS
    }),
  );

  // Cookie parser pour gérer les cookies httpOnly
  app.use(cookieParser());

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

  // CORS - credentials: true permet l'envoi de cookies cross-origin
  app.enableCors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'x-user-address',
    ],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight pendant 24h pour réduire les OPTIONS
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
