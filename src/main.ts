import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.useGlobalPipes(new ValidationPipe());
  
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  if (isProduction) {
    // Set global prefix for API routes in production
    app.setGlobalPrefix('api');
    
    // Serve static files from the 'public' directory in production
    app.use(express.static(join(__dirname, '..', 'public')));
    
    // For any other routes, serve the index.html (for client-side routing) in production
    app.use('*', (req, res) => {
      res.sendFile(join(__dirname, '..', 'public', 'index.html'));
    });
  }

  // CORS configuration
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:5173'),
    methods: ['GET', 'POST'],
    credentials: true,
  });

  await app.listen(configService.get('PORT', 8080));
}
bootstrap();