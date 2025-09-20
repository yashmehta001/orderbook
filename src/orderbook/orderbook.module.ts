import { Module } from '@nestjs/common';
import { OrderbookController } from './orderbook.controller';
import { OrderbookService } from './services/orderbook.service';
import { OrderBookEntity } from './entities/orderbook.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderBookRepository } from './repository/orderBook.repository';
import { LoggerModule } from '../utils/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderBookEntity]), LoggerModule],
  controllers: [OrderbookController],
  providers: [OrderbookService, OrderBookRepository],
  exports: [OrderbookService],
})
export class OrderbookModule {}
