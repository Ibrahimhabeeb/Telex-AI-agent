import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 8080; // ensure it uses the Railway-assigned port
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on port ${port}`);
}

bootstrap();
