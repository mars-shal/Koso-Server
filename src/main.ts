import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  // TODO(prod): restrict to the deployed frontend origin via CORS_ORIGINS
  // once the frontend has a stable production URL.
  app.enableCors();
  await app.listen(process.env.PORT ?? 3149);
}
await bootstrap();
