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
  orders: OrderBookEntity[];

  @Column(() => AuditInfo, { prefix: false })
  auditInfo: AuditInfo;
}
