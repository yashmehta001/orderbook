import { Injectable } from '@nestjs/common';
import { winston } from './winston';

@Injectable()
export class LoggerService {
  private readonly logger: typeof winston = winston;

  error(message: string, trace: string) {
    this.logger.error(message, { trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  info(message: string) {
    this.logger.info(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
