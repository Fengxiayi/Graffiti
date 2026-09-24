import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT || '3000');

  // 生产环境：托管前端构建产物，并对非 /api 的 GET 请求做 SPA fallback
  const clientDist = join(process.cwd(), 'client', 'dist');
  if (existsSync(clientDist)) {
    app.useStaticAssets(clientDist);
    app.use((req: { method: string; path: string }, res: { sendFile: (p: string) => void }, next: () => void) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(join(clientDist, 'index.html'));
      } else {
        next();
      }
    });
    Logger.log(`Static assets served from ${clientDist}`);
  }

  await app.listen(port, '0.0.0.0');
  Logger.log(`大展宏涂服务已启动: http://0.0.0.0:${port}`);
  Logger.log(`API 地址: http://0.0.0.0:${port}/api`);
}

bootstrap();
