import { forwardRef, Module } from '@nestjs/common';
import { OrderbookController } from './orderbook.controller';
import { OrderbookService } from './services/orderbook.service';
import { OrderBookEntity } from './entities/orderbook.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderBookRepository } from './repository/orderBook.repository';
import { LoggerModule } from '../utils/logger/logger.module';
import { OrderHistoryModule } from '../orderHistory/orderHistory.module';
import { MatchingLogicService } from './services/matchingLogic.service';
import { WalletModule } from '../wallet/wallet.module';
import { FundsProcessorService } from './services/fundsProcessor.service';
import { DatabaseModule } from '../database/database.module';
import { OrderHistoryService } from '../orderHistory/services/orderHistory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderBookEntity]),
    LoggerModule,
    forwardRef(() => WalletModule),
    OrderHistoryModule,
    DatabaseModule,
  ],
  controllers: [OrderbookController],
  providers: [
    OrderbookService,
    {
      provide: 'IOrderBookRepository',
      useClass: OrderBookRepository,
    },
    {
      provide: 'IFundsProcessorService',
      useClass: FundsProcessorService,
    },
    {
      provide: 'IMatchingLogicService',
      useClass: MatchingLogicService,
    },
    {
      provide: 'IOrderHistoryService',
      useClass: OrderHistoryService,
    },
  ],
  exports: [OrderbookService],
})
export class OrderbookModule {}
