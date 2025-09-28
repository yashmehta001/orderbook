import { EntityManager } from 'typeorm';
import { CreateOrderHistoryDto } from '../dto';
import { OrderHistoryEntity } from '../entities/orderHistory.entity';
import { IBaseRepository } from '../../core/interfaces/BaseRepository.interface';

export interface IOrderHistoryRepository
  extends IBaseRepository<OrderHistoryEntity> {
  save(
    orderInfo: Partial<CreateOrderHistoryDto>,
    manager?: EntityManager,
  ): Promise<OrderHistoryEntity>;

  getByUserId(userId: string): Promise<OrderHistoryEntity[]>;
}
