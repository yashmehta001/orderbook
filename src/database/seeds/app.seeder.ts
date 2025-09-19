import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { UserService } from 'src/users/services/users.service';
import { seedUser } from 'src/core/config';

@Injectable()
export class AppSeeder {
  constructor(
    private readonly logger: LoggerService,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}
  static logInfo = 'Database - Seed:';
  async seed(): Promise<void> {
    this.logger.info(`${AppSeeder.logInfo} Seeding Initialized`);

    // Seed User
    await this.userService.createUser(seedUser);

    this.logger.info(`${AppSeeder.logInfo} Seeding Completed`);
  }
}
