import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OrderbookService } from '../../orderbook/services/orderbook.service';
import { OrderSideEnum } from '../../core/config/constants';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { errorMessages } from '../../core/config';
import { CustomError, NotFoundException } from '../../core/errors';
import { EntityManager } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';
import type { IWalletsRepository } from '../interfaces/wallets.repository.interface';
import { IWalletService } from '../interfaces/wallet.service.interface';

@Injectable()
export class WalletService implements IWalletService {
  constructor(
    @Inject('IWalletsRepository')
    private readonly walletsRepository: IWalletsRepository,
    @Inject(forwardRef(() => OrderbookService))
    private readonly orderbookService: OrderbookService,
    private readonly logger: LoggerService,
  ) {}
  static logInfo = 'WalletService';
  async getUserFunds(id: string): Promise<WalletEntity | null> {
    try {
      this.logger.info(
        ` ${WalletService.logInfo} Fetching funds for userId: ${id}`,
      );
      const userFunds = await this.walletsRepository.findOneById(id);
      this.logger.info(`UserId: ${id} has funds: ${userFunds?.funds}`);
      return userFunds;
    } catch (error) {
      this.logger.error(
        ` ${WalletService.logInfo} Error fetching funds for userId: ${id}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        error,
      );
      throw error;
    }
  }

  async updateUserFunds(
    id: string,
    funds: number = 0,
    manager?: EntityManager,
  ): Promise<WalletEntity> {
    try {
      this.logger.info(
        ` ${WalletService.logInfo} Updating funds for userId: ${id} with payload: ${funds}`,
      );
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
      this.logger.info(
        ` ${WalletService.logInfo} Updated funds for userId: ${id} with payload: ${funds}. New balance: ${userFunds.funds}`,
      );
      return userFunds;
    } catch (error) {
      this.logger.error(
        ` ${WalletService.logInfo} Error updating funds for userId: ${id} with payload: ${funds}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        error,
      );
      throw error;
    }
  }

  //Total funds locked in pending buy orders
  private async getLockedFundsForPendingBuys(userId: string): Promise<number> {
    try {
      this.logger.info(
        ` ${WalletService.logInfo} Fetching locked funds for userId: ${userId}`,
      );
      const presentBuyOrders = await this.orderbookService.getOrdersByUserId(
        userId,
        OrderSideEnum.BUY,
      );
      if (!presentBuyOrders.length) {
        this.logger.info(
          ` ${WalletService.logInfo} No pending buy orders for userId: ${userId}`,
        );
        return 0;
      }
      const pledgedFunds = presentBuyOrders.reduce(
        (sum, o) => sum + (o?.price ?? 0) * (o?.quantity ?? 0),
        0,
      );
      this.logger.info(
        ` ${WalletService.logInfo} Locked funds for userId: ${userId} is ${pledgedFunds}`,
      );
      return pledgedFunds;
    } catch (error) {
      this.logger.error(
        ` ${WalletService.logInfo} Error fetching locked funds for userId: ${userId}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        error,
      );
      throw error;
    }
  }

  async validateBalance(userId: string, updateFunds: number): Promise<boolean> {
    try {
      this.logger.info(
        ` ${WalletService.logInfo} Validating balance for userId: ${userId} with payload: ${updateFunds}`,
      );
      const userFunds = await this.getUserFunds(userId);
      if (!userFunds) {
        this.logger.warn(
          ` ${WalletService.logInfo} No wallet found for userId: ${userId}`,
        );
        throw new NotFoundException();
      }
      const pledgedFunds = await this.getLockedFundsForPendingBuys(userId);
      const hasSufficientBalance =
        userFunds.funds - updateFunds - pledgedFunds >= 0;
      this.logger.info(
        ` ${WalletService.logInfo} UserId: ${userId} has sufficient balance: ${hasSufficientBalance} with current funds: ${userFunds.funds}, pledgedFunds: ${pledgedFunds} and updateFunds: ${updateFunds}`,
      );
      return hasSufficientBalance;
    } catch (error) {
      this.logger.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${OrderbookService.logInfo} ${error.message} for userId: ${userId} payload: ${updateFunds}`,
      );
      throw error;
    }
  }
}
