import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from './utils/utils.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { OrderbookModule } from './orderbook/orderbook.module';
import { validateEnv } from './core/config';
import { SeedsModule } from './database/seeds/seeds.module';
import { OrderHistoryModule } from './orderHistory/orderHistory.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      expandVariables: true,
      cache: true,
      validate: validateEnv,
    }),
    UtilsModule,
    DatabaseModule,
    UsersModule,
    OrderbookModule,
    ...(process.env.NODE_ENV === 'development' ? [SeedsModule] : []),
    OrderHistoryModule,
    WalletModule,
  ],
})
export class AppModule {}
