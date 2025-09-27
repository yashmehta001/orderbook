import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { WalletsRepository } from '../repository/wallets.repository';
import { OrderbookService } from '../../orderbook/services/orderbook.service';
import { OrderSideEnum } from '../../core/config/constants';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { errorMessages } from '../../core/config';
import { CustomError } from '../../core/errors';
import { EntityManager } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletsRepository: WalletsRepository,
    @Inject(forwardRef(() => OrderbookService))
    private readonly orderbookService: OrderbookService,
    private readonly logger: LoggerService,
  ) {}

  async getUserFunds(id: string): Promise<WalletEntity> {
    const userFunds = await this.walletsRepository.findOneById(id);
    const funds = userFunds ? userFunds.funds : 0;
    return userFunds ?? ({ id, funds } as WalletEntity);
  }

  async updateUserFunds(
    id: string,
    funds: number = 0,
    manager?: EntityManager,
  ): Promise<WalletEntity> {
    const userFunds = await this.walletsRepository.findOneById(id);
    if (!userFunds) {
      const newUserFunds = await this.walletsRepository.save(
        { id, funds },
        manager,
      );
      return newUserFunds;
    }
    userFunds.funds += funds;
    if (userFunds.funds < 0) {
      throw new CustomError(errorMessages.INSUFFICIENT_BALANCE);
    }
    await this.walletsRepository.saveEntity(userFunds, manager);
    return userFunds;
  }

  //Total funds locked in pending buy orders
  private async getLockedFundsForPendingBuys(userId: string): Promise<number> {
    const presentBuyOrders = await this.orderbookService.getOrdersByUserId(
      userId,
      OrderSideEnum.BUY,
    );

    return presentBuyOrders.reduce(
      (sum, o) => sum + (o?.price ?? 0) * (o?.quantity ?? 0),
      0,
    );
  }

  async validateBalance(userId: string, updateFunds: number): Promise<boolean> {
    try {
      const { funds } = await this.getUserFunds(userId);
      const pledgedFunds = await this.getLockedFundsForPendingBuys(userId);

      return funds - updateFunds - pledgedFunds >= 0;
    } catch (error) {
      this.logger.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${OrderbookService.logInfo} ${error.message} for userId: ${userId} payload: ${updateFunds}`,
      );
      throw error;
    }
  }
}
