import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerLoader } from './utils/loaders';
import { ValidationPipe } from '@nestjs/common';
import { ExceptionHandlerFilter } from './core/errors/exception-handler.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global middlewares/pipes/filters
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new ExceptionHandlerFilter());

  // Swagger docs
  swaggerLoader(app);

  // 🔑 Use ConfigService to get validated port
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
}
bootstrap();
