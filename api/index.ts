import type { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import 'reflect-metadata';

import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Express } from 'express';

let cachedInstance: Express | null = null;

async function getInstance(): Promise<Express> {
  if (cachedInstance) return cachedInstance;

  const { AppModule } = await import(
    join(process.cwd(), 'dist/server/app.module.js')
  );

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('');
  app.set('trust proxy', true);

  await app.init();
  cachedInstance = app.getHttpAdapter().getInstance();

  const logger = new Logger('VercelBootstrap');
  logger.log('NestJS app initialized');

  return cachedInstance;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const instance = await getInstance();
  instance(req, res);
}
