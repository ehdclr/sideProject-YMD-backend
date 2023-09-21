import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('YMD API 문서')
    .setDescription('YMD API Swagger 문서입니다.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력해주세요',
        in: 'header',
      },
      'accessToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
}
