import { HttpExceptionFilter } from './commons/filters/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from './commons/utils/swagger-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configSwagger(app);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
