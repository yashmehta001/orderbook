import { OrderBookEntity } from '../../orderbook/entities/orderbook.entity';
import { AuditInfo } from '../../core/entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { OrderHistoryEntity } from '../../orderHistory/entities/orderHistory.entity';

@Entity({
  name: 'users',
})
@Unique(['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    name: 'first_name',
  })
  firstName: string;

  @Column({
    nullable: true,
    name: 'last_name',
  })
  lastName: string;

  @Column()
  @Index()
  email: string;

  @Column()
  password: string;

  @Column({
    default: 0,
  })
  funds: number;

  @OneToMany(() => OrderBookEntity, (order) => order.user, { cascade: true })
  orders?: OrderBookEntity[];

  @OneToMany(() => OrderHistoryEntity, (orderHistory) => orderHistory.user, {
    cascade: true,
  })
  orderHistory?: OrderHistoryEntity[];

  @Column(() => AuditInfo, { prefix: false })
  auditInfo: AuditInfo;
}
