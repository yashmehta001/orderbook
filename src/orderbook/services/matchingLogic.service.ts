import { Injectable } from '@nestjs/common';
import { OrderHistoryService } from '../../orderHistory/services/orderHistory.service';
import { CreateBuyOrderReqDto, CreateSellOrderReqDto, ITrade } from '../dto';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { EntityManager } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MatchingLogicService {
  constructor(private readonly orderHistoryService: OrderHistoryService) {}

  async matchOrders(params: {
    initiatorId: string;
    orderInfo: CreateBuyOrderReqDto | CreateSellOrderReqDto;
    oppositeOrders: OrderBookEntity[];
    isSell: boolean;
    manager: EntityManager;
    orderId?: string;
  }): Promise<{
    trades: ITrade[];
    ordersToRemove: string[];
    ordersToUpdate: { id: string; quantity: number }[];
    remainingQuantity: number;
  }> {
    const { initiatorId, orderInfo, oppositeOrders, isSell, orderId, manager } =
      params;

    let remainingQuantity = orderInfo.quantity;
    const trades: ITrade[] = [];
    const ordersToRemove: string[] = [];
    const ordersToUpdate: { id: string; quantity: number }[] = [];

    for (const opposite of oppositeOrders) {
      if (remainingQuantity <= 0) break;

      const availableQty = opposite.quantity;
      const tradeQty = Math.min(remainingQuantity, availableQty);

      const trade: ITrade = isSell
        ? this.buildSellTrade(opposite, initiatorId, orderInfo, tradeQty)
        : this.buildBuyTrade(
            opposite,
            initiatorId,
            orderInfo,
            tradeQty,
            orderId!,
          );

      trades.push(trade);

      if (trade.quantity > 0) {
        await this.recordTradeHistory(
          isSell,
          initiatorId,
          opposite,
          orderInfo,
          tradeQty,
          manager,
          orderId,
        );
      }

      if (availableQty <= remainingQuantity) {
        ordersToRemove.push(opposite.id);
      } else {
        ordersToUpdate.push({
          id: opposite.id,
          quantity: availableQty - tradeQty,
        });
      }

      remainingQuantity -= tradeQty;
    }

    return { trades, ordersToRemove, ordersToUpdate, remainingQuantity };
  }

  private buildSellTrade(
    opposite: OrderBookEntity,
    sellerId: string,
    orderInfo: CreateSellOrderReqDto,
    qty: number,
  ): ITrade {
    return {
      buyOrderId: opposite.id,
      buyerId: opposite?.user?.id,
      sellUserId: sellerId,
      stockName: orderInfo.stockName,
      price: orderInfo.price,
      quantity: qty,
    };
  }

  private buildBuyTrade(
    opposite: OrderBookEntity,
    buyerId: string,
    orderInfo: CreateBuyOrderReqDto,
    qty: number,
    orderId: string,
  ): ITrade {
    return {
      buyerId,
      sellOrderId: opposite.id,
      sellerId: opposite?.user?.id,
      stockName: orderInfo.stockName,
      price: opposite.price,
      quantity: qty,
      id: orderId,
    };
  }

  private async recordTradeHistory(
    isSell: boolean,
    initiatorId: string,
    opposite: OrderBookEntity,
    orderInfo: CreateBuyOrderReqDto | CreateSellOrderReqDto,
    quantity: number,
    manager: EntityManager,
    orderId?: string,
  ): Promise<void> {
    if (isSell) {
      await this.orderHistoryService.createOrderHistory(
        {
          ...opposite,
          price: orderInfo.price,
          quantity,
        },
        manager,
      );
    } else {
      await this.orderHistoryService.createOrderHistory(
        {
          ...opposite,
          quantity,
        },
        manager,
      );
      await this.orderHistoryService.createOrderHistory(
        {
          ...orderInfo,
          user: { id: initiatorId },
          id: (orderId as string) ?? uuid(),
          quantity,
          price: opposite.price,
        },
        manager,
      );
    }
  }
}
