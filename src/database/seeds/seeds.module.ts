import { Module } from '@nestjs/common';
import { AppSeeder } from './app.seeder';
import { LoggerModule } from '../../utils/logger/logger.module';
import { DatabaseProvider } from '../config/database.providers';

@Module({
  imports: [LoggerModule, DatabaseProvider],
  providers: [AppSeeder],
})
export class SeedsModule {}
