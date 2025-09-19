import { UserType } from '../../../utils/token/types';

export class UserProfileReqDto {
  id: string;
  userType: UserType.USER;
  email: string;
  iat: number;
  exp: number;
}
