import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { WalletService } from '../../wallet/services/wallet.service';
import { EntityManager } from 'typeorm';
import { ITrade } from '../dto';
import { IFundsProcessorService } from '../interfaces';
import { LoggerService } from '../../utils/logger/WinstonLogger';

@Injectable()
export class FundsProcessorService implements IFundsProcessorService {
  constructor(
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    private readonly logger: LoggerService,
  ) {}
  private static readonly logInfo = 'FundsProcessorService';
  public async processFundsForSell(
    sellerId: string,
    trades: ITrade[],
    price: number,
    manager: EntityManager,
  ): Promise<void> {
    this.logger.info(
      ` ${FundsProcessorService.logInfo} Processing funds for sellerId: ${sellerId} with trades: ${JSON.stringify(
        trades,
      )} and price: ${price}`,
    );
    const sellerCredit = trades.reduce((sum, t) => sum + t.quantity * price, 0);
    await this.walletService.updateUserFunds(sellerId, sellerCredit, manager);

    const buyerDebits: Record<string, number> = {};
    for (const { buyerId, quantity, price: tradePrice } of trades) {
      buyerDebits[buyerId] =
        (buyerDebits[buyerId] || 0) - quantity * tradePrice;
    }

    await Promise.all(
      Object.entries(buyerDebits).map(([buyerId, deltaFunds]) =>
        this.walletService.updateUserFunds(buyerId, deltaFunds, manager),
      ),
    );
    this.logger.info(
      ` ${FundsProcessorService.logInfo} Completed processing funds for sellerId: ${sellerId}`,
    );
  }

  public async processFundsForBuy(
    buyerId: string,
    trades: ITrade[],
    manager: EntityManager,
  ): Promise<void> {
    this.logger.info(
      ` ${FundsProcessorService.logInfo} Processing funds for buyerId: ${buyerId} with trades: ${JSON.stringify(
        trades,
      )}`,
    );
    const sellerCredits: Record<string, number> = {};
    let buyerDebit = 0;

    for (const { sellerId, quantity, price } of trades) {
      const total = quantity * price;
      buyerDebit -= total;
      const sellerKey: string = String(sellerId);
      sellerCredits[sellerKey] = (sellerCredits[sellerKey] || 0) + total;
    }

    await this.walletService.updateUserFunds(buyerId, buyerDebit, manager);

    await Promise.all(
      Object.entries(sellerCredits).map(([sellerId, delta]) => {
        return this.walletService.updateUserFunds(sellerId, delta, manager);
      }),
    );
    this.logger.info(
      ` ${FundsProcessorService.logInfo} Completed processing funds for buyerId: ${buyerId}`,
    );
  }
}
