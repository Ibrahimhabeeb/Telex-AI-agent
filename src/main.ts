import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
const port = Number(process.env.PORT);
if (!port) {
  console.error('PORT env variable is missing — Railway will stop the container!');
  process.exit(1);
}
await app.listen(port, '0.0.0.0');
}

bootstrap();
