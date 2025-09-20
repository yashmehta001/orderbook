import { Module } from '@nestjs/common';
import { OrderHistoryController } from './orderHistory.controller';
import { OrderHistoryService } from './services/orderHistory.service';
import { LoggerModule } from '../utils/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderHistoryEntity } from './entities/orderHistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderHistoryEntity]), LoggerModule],
  controllers: [OrderHistoryController],
  providers: [OrderHistoryService],
  exports: [OrderHistoryService],
})
export class OrderHistoryModule {}
