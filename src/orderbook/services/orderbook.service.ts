import { Inject, Injectable } from '@nestjs/common';
import { OrderBookRepository } from '../repository/orderBook.repository';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { CreateOrderBookReqDto } from '../dto';

@Injectable()
export class OrderbookService {
  constructor(
    @Inject(OrderBookRepository)
    private readonly orderBookRepository: OrderBookRepository,

    private readonly logger: LoggerService,
  ) {}

  static logInfo = 'Service - OrderBook:';
  async createOrder(userId: string, orderInfo: CreateOrderBookReqDto) {
    this.logger.info(
      `${OrderbookService.logInfo} Create Order for userId: ${userId}`,
    );
    const order = await this.orderBookRepository.save(userId, orderInfo);
    this.logger.info(
      `${OrderbookService.logInfo} Created Order for userId: ${userId}`,
    );
    return order;
  }
}
