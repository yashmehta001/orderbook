import { CreateOrderBookReqDto } from '../../../orderbook/dto';

export class CreateOrderHistoryDto extends CreateOrderBookReqDto {
  id: string;
  user: { id: string };
}
