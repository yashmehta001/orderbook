import { IJwtService } from '../../../utils/token/services/';

export const mockTokenService = (): IJwtService => ({
  token: jest.fn(),
  decode: jest.fn(),
});
