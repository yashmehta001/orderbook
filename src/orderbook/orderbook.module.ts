import { Module } from '@nestjs/common';
import { OrderbookController } from './orderbook.controller';
import { OrderbookService } from './services/orderbook.service';
import { OrderBookEntity } from './entities/orderbook.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([OrderBookEntity])],
  controllers: [OrderbookController],
  providers: [OrderbookService],
})
export class OrderbookModule {}
