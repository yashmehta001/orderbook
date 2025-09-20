import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { CreateOrderBookReqDto } from '../dto';

@Injectable()
export class OrderBookRepository {
  constructor(
    @InjectRepository(OrderBookEntity)
    private readonly orderBookRepo: Repository<OrderBookEntity>,
  ) {}

  async save(
    userId: string,
    orderInfos: CreateOrderBookReqDto,
  ): Promise<OrderBookEntity> {
    const orderEntity = this.orderBookRepo.create({
      ...orderInfos,
      user: { id: userId },
    });
    return await this.orderBookRepo.save(orderEntity);
  }
}
