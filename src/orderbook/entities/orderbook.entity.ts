import { UserEntity } from '../../users/entities';
import { AuditInfo } from '../../core/entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  BeforeInsert,
} from 'typeorm';
import { OrderSideEnum } from '../../core/config';
import { v4 as uuid } from 'uuid';

@Entity({
  name: 'Order_Book',
})
export class OrderBookEntity {
  @PrimaryColumn({ type: 'uuid' })
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

  @Column(() => AuditInfo, { prefix: false })
  auditInfo: AuditInfo;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}
