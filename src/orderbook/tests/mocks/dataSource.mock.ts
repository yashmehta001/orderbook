export const mockDataSource = {
  transaction: jest.fn(),
  createQueryRunner: jest.fn().mockReturnThis(),
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
};
