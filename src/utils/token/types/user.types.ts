import { UserType } from './user.enum';

export type userType = {
  id: string;
  email?: string;
  userType?: UserType;
};
