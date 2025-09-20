import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { CreateOrderBookDto } from '../dto';

@Injectable()
export class OrderBookRepository {
  constructor(
    @InjectRepository(OrderBookEntity)
    private readonly orderBookRepo: Repository<OrderBookEntity>,
  ) {}

 async save(
  userId: string,
  orderInfos: CreateOrderBookDto[],
): Promise<OrderBookEntity[]> {
  const orderEntities = orderInfos.map((orderInfo) =>
    this.orderBookRepo.create({
      ...orderInfo,
      user: { id: userId },
    }),
  );

  return await this.orderBookRepo.save(orderEntities);
}

}
