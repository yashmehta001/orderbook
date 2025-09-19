// src/database/config/orm.config.ts
import { DataSource } from 'typeorm';
import { validateEnv } from '../../core/config/env.validation';

// validate process.env using the same class-validator logic
const env = validateEnv(process.env);

export default new DataSource({
  type: 'postgres',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // keep false in CLI too
  logging: env.DATABASE_LOGGING,
});
