import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    instrument: ObserveInstrument,
  });
  await app.listen(process.env.PORT ?? 3149);
}
await bootstrap();
