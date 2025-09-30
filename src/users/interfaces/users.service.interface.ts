import { UserCreateReqDto, UserLoginReqDto } from '../dto';

export interface IUserService {
  createUser(data: UserCreateReqDto): Promise<{ user: any; token: string }>;
  loginUser(data: UserLoginReqDto): Promise<{ user: any; token: string }>;
  profile(id: string): Promise<any>;
}
