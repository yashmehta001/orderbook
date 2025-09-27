import { forwardRef, Module } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { WalletEntity } from './entities/wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderbookModule } from '../orderbook/orderbook.module';
import { LoggerModule } from '../utils/logger/logger.module';
import { WalletsRepository } from './repository/wallets.repository';
import { WalletController } from './wallet.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity]),
    LoggerModule,
    forwardRef(() => OrderbookModule),
  ],
  controllers: [WalletController],
  providers: [WalletService, WalletsRepository],
  exports: [WalletService],
})
export class WalletModule {}
