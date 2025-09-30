import { EntityManager } from 'typeorm';
import { ITrade } from '../dto';

export interface IFundsProcessorService {
  processFundsForSell(
    sellerId: string,
    trades: ITrade[],
    price: number,
    manager: EntityManager,
  ): Promise<void>;

  processFundsForBuy(
    buyerId: string,
    trades: ITrade[],
    manager: EntityManager,
  ): Promise<void>;
}
