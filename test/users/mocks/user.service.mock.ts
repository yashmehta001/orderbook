import { IUserService } from '../../../src/users/interfaces';

export const mockUserService = (): IUserService => ({
  createUser: jest.fn(),
  loginUser: jest.fn(),
  profile: jest.fn(),
});
