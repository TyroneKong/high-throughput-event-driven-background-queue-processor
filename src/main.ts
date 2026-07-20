import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow your Next.js app (running on 3001) to read this API safely
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  // Force your backend onto port 3000 to avoid port clashes
  await app.listen(3002);
  console.log('🚀 Backend running on http://localhost:3002');
}
bootstrap();
