import { UserEntity } from '../../users/entities';
import { AuditInfo } from '../../core/entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'wallets' })
export class WalletEntity {
  @PrimaryColumn()
  id: string;

  @OneToOne(() => UserEntity, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user: UserEntity;

  @Column({ default: 0 })
  funds: number;

  @Column(() => AuditInfo, { prefix: false })
  auditInfo: AuditInfo;
}
