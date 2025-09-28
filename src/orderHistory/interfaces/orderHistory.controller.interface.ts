import { UserProfileReqDto } from '../../users/dto';
import { OrderHistoryTransactionResDto } from '../dto';

export interface IOrderHistoryController {
  history(user: UserProfileReqDto): Promise<OrderHistoryTransactionResDto[]>;
}
