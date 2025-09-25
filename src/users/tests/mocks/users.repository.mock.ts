import { IUserRepository } from '../../repository/users.repository';

export const mockUsersRepository = (): IUserRepository => ({
  getByEmail: jest.fn(),
  getById: jest.fn(),
  save: jest.fn(),
});
