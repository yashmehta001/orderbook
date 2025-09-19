import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createDatabaseConfig } from './src/database/config/database.config';

const configService = new ConfigService();

export default new DataSource(createDatabaseConfig(configService));
