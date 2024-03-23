import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

const SERVICE_NAME = 'simple-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  app.setGlobalPrefix(`${SERVICE_NAME}/api/v1`)
  app.use(helmet())
  await app.listen(3000);
}
bootstrap();
