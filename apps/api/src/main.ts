import { createRequire } from 'node:module';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { buildCorsOptions } from './config/cors-origin';

const require = createRequire(__filename);
require(join(__dirname, '../../../scripts/merge-workspace-env.mjs')).applyWorkspaceEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = Number(process.env.PORT ?? config.get<number>('API_PORT', 4000));

  app.enableCors(buildCorsOptions(config));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(port, '0.0.0.0');
  const revision = process.env.RAILWAY_GIT_COMMIT_SHA ?? 'local';
  console.log(`Medfile API listening on 0.0.0.0:${port} (rev ${revision.slice(0, 7)})`);
}

void bootstrap();
