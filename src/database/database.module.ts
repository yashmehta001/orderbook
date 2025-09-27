import { Module } from '@nestjs/common';
import { DatabaseProvider } from './config/database.providers';
import { TransactionManagerService } from './services/transaction-manager.service';

@Module({
  imports: [DatabaseProvider],
  exports: [DatabaseProvider, TransactionManagerService],
  providers: [TransactionManagerService],
})
export class DatabaseModule {}
