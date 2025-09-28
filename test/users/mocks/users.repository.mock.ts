import { IUserRepository } from '../../../src/users/interfaces';

export const mockUsersRepository = (): IUserRepository => ({
  getByEmail: jest.fn(),
  getById: jest.fn(),
  save: jest.fn(),
});
