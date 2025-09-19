import { IHashService } from '../../../utils/hash/hash.service';

export const mockHashService = (): IHashService => ({
  hash: jest.fn(),
  compare: jest.fn(),
});
