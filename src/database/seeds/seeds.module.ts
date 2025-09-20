import { Module } from '@nestjs/common';
import { AppSeeder } from './app.seeder';
import { LoggerModule } from '../../utils/logger/logger.module';
import { DatabaseProvider } from '../config/database.providers';
import { UsersModule } from '../../users/users.module';
import { SeedsController } from './seeds.controller';
import { OrderbookModule } from '../../orderbook/orderbook.module';

@Module({
  imports: [LoggerModule, DatabaseProvider, UsersModule,OrderbookModule],
  providers: [AppSeeder],
  controllers: [SeedsController],
})
export class SeedsModule {}
