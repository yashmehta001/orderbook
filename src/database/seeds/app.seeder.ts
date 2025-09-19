import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../utils/logger/WinstonLogger';

@Injectable()
export class AppSeeder {
  constructor(private readonly logger: LoggerService) {}
  static logInfo = 'Database - Seed:';
  async seed(): Promise<void> {
    this.logger.info(`${AppSeeder.logInfo} Seeding Initialized`);

    // Seed Admin Users
    // await this.adminService.seedAdminUserGroup();

    this.logger.info(`${AppSeeder.logInfo} Seeding Completed`);
  }
}
