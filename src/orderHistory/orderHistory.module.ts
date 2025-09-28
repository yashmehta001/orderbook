import { Module } from '@nestjs/common';
import { OrderHistoryController } from './orderHistory.controller';
import { OrderHistoryService } from './services/orderHistory.service';
import { LoggerModule } from '../utils/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderHistoryEntity } from './entities/orderHistory.entity';
import { OrderHistoryRepository } from './repository/orderHistory.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OrderHistoryEntity]), LoggerModule],
  controllers: [OrderHistoryController],
  providers: [
    OrderHistoryService,
    {
      provide: 'IOrderHistoryRepository',
      useClass: OrderHistoryRepository,
    },
  ],
  exports: [OrderHistoryService],
})
export class OrderHistoryModule {}
