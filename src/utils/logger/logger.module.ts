import { Module } from '@nestjs/common';
import { LoggerService } from './WinstonLogger';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
