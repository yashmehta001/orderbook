import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const createDatabaseConfig = (config: ConfigService): DataSourceOptions => ({
  type: 'postgres',
  host: config.get<string>('DATABASE_HOST'),
  port: config.get<number>('DATABASE_PORT'),
  username: config.get<string>('DATABASE_USER'),
  password: config.get<string>('DATABASE_PASSWORD'),
  database: config.get<string>('DATABASE_NAME'),
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: config.get<boolean>('DATABASE_LOGGING') ?? false,
});