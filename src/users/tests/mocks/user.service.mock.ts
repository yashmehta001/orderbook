import { IUserService } from '../../services/users.service';

export const mockUserService = (): IUserService => ({
  createUser: jest.fn(),
  loginUser: jest.fn(),
  profile: jest.fn(),
});
