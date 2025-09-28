import {
  UserCreateReqDto,
  UserLoginReqDto,
  UserLoginResDto,
  UserProfileReqDto,
} from '../dto';
import { UserEntity } from '../entities';

export interface IUsersController {
  signUp(body: UserCreateReqDto): Promise<UserLoginResDto>;
  login(body: UserLoginReqDto): Promise<UserLoginResDto>;
  profile(user: UserProfileReqDto): Promise<UserEntity | null>;
}
