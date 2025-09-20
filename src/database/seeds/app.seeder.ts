import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { UserService } from '../../users/services/users.service';
import { seedOrders, seedUser } from '../../core/config';
import { OrderbookService } from '../../orderbook/services/orderbook.service';

@Injectable()
export class AppSeeder {
  constructor(
    private readonly logger: LoggerService,
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(OrderbookService)
    private readonly orderbookService: OrderbookService,
  ) {}
  static logInfo = 'Database - Seed:';
  async seed(): Promise<void> {
    this.logger.info(`${AppSeeder.logInfo} Seeding Initialized`);

    // Seed User
    const { user } = await this.userService.createUser(seedUser);
    seedOrders.forEach(async (seedOrder) => {
      await this.orderbookService.createOrder(user.id, seedOrder);
    });

    this.logger.info(`${AppSeeder.logInfo} Seeding Completed`);
  }
}
