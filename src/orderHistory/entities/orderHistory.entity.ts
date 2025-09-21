import { UserEntity } from '../../users/entities';
import { AuditInfo } from '../../core/entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderSideEnum } from '../../core/config';

@Entity({
  name: 'Order_History',
})
export class OrderHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'stock_name',
  })
  stockName: string;

  @Column({
    type: 'varchar',
  })
  side: OrderSideEnum;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'transaction_id',
  })
  transactionId: string;

  @Column(() => AuditInfo, { prefix: false })
  auditInfo: AuditInfo;
}
