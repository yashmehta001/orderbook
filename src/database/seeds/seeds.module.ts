import { Module } from '@nestjs/common';
import { AppSeeder } from './app.seeder';
import { LoggerModule } from '../../utils/logger/logger.module';
import { DatabaseProvider } from '../config/database.providers';
import { UsersModule } from '../../users/users.module';
import { SeedsController } from './seeds.controller';

@Module({
  imports: [LoggerModule, DatabaseProvider, UsersModule],
  providers: [AppSeeder],
  controllers: [SeedsController],
})
export class SeedsModule {}
