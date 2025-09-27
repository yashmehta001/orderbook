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
    OrderBookRepository,
    MatchingLogicService,
    FundsProcessorService,
  ],
  exports: [OrderbookService],
})
export class OrderbookModule {}
