import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// eslint-disable-next-line func-names
export const swaggerLoader = function (app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Project')
    .setDescription('Project API Description')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/docs', app, document);
};
