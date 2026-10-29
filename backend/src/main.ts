import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap'); // Dynamic services loaded
  const app = await NestFactory.create(AppModule);

  // Ensure persistent uploads directory exists for image storage
  const uploadsDir = path.join(process.cwd(), 'uploads', 'products');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure body limit (25MB) to safely support rich product payloads and image transfers
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const rawFrontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const allowedOrigins = rawFrontendUrl
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (!allowedOrigins.includes('http://localhost:3000')) {
    allowedOrigins.push('http://localhost:3000');
  }

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        allowedOrigins.some((allowed) => origin.startsWith(allowed));
      if (isAllowed || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`Backend server running on http://localhost:${port}/api/v1`);
  logger.log(`Health check available at http://localhost:${port}/api/v1/health`);
}

bootstrap();
