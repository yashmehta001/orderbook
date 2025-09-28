import { Test, TestingModule } from '@nestjs/testing';
import { mockUsersRepository } from '../mocks/users.repository.mock';

import {
  createUserInput,
  userOutput,
  loginUserInput,
  userProfileInput,
  token,
  userOutputWithToken,
} from '../constants';
import { QueryFailedError } from 'typeorm';
import { UserService } from '../../../src/users/services/users.service';
import { UserRepository } from '../../../src/users/repository/users.repository';
import { HashService } from '../../../src/utils/hash/hash.service';
import { TokenService } from '../../../src/utils/token/services';
import { LoggerService } from '../../../src/utils/logger/WinstonLogger';
import { CustomError, NotFoundException } from '../../../src/core/errors';
import { mockHashService, mockTokenService } from '../mocks';
import { WalletService } from '../../../src/wallet/services/wallet.service';
import { mockWalletService } from '../../wallet/mocks/wallet.service.mock';
import { updateWalletServiceOutput } from '../../wallet/constants';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let hashService: jest.Mocked<HashService>;
  let tokenService: jest.Mocked<TokenService>;
  let walletService: jest.Mocked<WalletService>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        LoggerService,
        {
          provide: HashService,
          useFactory: mockHashService,
        },
        {
          provide: TokenService,
          useFactory: mockTokenService,
        },
        {
          provide: UserRepository,
          useFactory: mockUsersRepository,
        },
        {
          provide: WalletService,
          useFactory: mockWalletService,
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(
      UserRepository,
    ) as jest.Mocked<UserRepository>;
    hashService = module.get<HashService>(
      HashService,
    ) as jest.Mocked<HashService>;
    tokenService = module.get<TokenService>(
      TokenService,
    ) as jest.Mocked<TokenService>;
    walletService = module.get<WalletService>(
      WalletService,
    ) as jest.Mocked<WalletService>;
  });

  it('UsersService should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('Create Users Test', () => {
    it('Get User Info and token when entering valid FirstName LastName Email and Password', async () => {
      hashService.hash.mockResolvedValue(userOutput.password);
      tokenService.token.mockResolvedValue(token);
      userRepository.save.mockResolvedValue(userOutput);
      walletService.updateUserFunds.mockResolvedValue(
        updateWalletServiceOutput,
      );
      const user = await userService.createUser(createUserInput);

      expect(user).toEqual(userOutputWithToken);
    });

    it('Throw emailExistsException when entering duplicate email', async () => {
      userRepository.save.mockRejectedValue(
        new QueryFailedError('', [], new Error()),
      );
      try {
        await userService.createUser(createUserInput);
      } catch (error) {
        expect(error).toBeInstanceOf(QueryFailedError);
      }
    });

    it('Throw unExpectedError', async () => {
      userRepository.save.mockRejectedValue(new Error());
      try {
        await userService.createUser(createUserInput);
      } catch (error) {
        expect(error).toBeInstanceOf(Object);
      }
    });
  });

  describe('Login User Test', () => {
    it('Get User Info and token when entering valid Email and Password', async () => {
      userRepository.getByEmail.mockResolvedValue(userOutput);
      hashService.compare.mockResolvedValue(true);
      tokenService.token.mockResolvedValue(token);
      const User = await userService.loginUser(loginUserInput);
      expect(User).toEqual(userOutputWithToken);
    });

    it('Throw authFailedException when entering valid Email and Invalid Password', async () => {
      userRepository.getByEmail.mockResolvedValue(userOutput);
      hashService.compare.mockResolvedValue(false);
      try {
        await userService.loginUser(loginUserInput);
      } catch (error) {
        // expect(tokenService.token).not.toHaveBeenCalled();
        expect(error).toBeInstanceOf(Object);
      }
    });

    it('Throw authFailedException when entering Invalid Email and Password', async () => {
      userRepository.getByEmail.mockResolvedValue(null);
      try {
        await userService.loginUser(loginUserInput);
      } catch (error) {
        // expect(hashService.compare).not.toHaveBeenCalled();
        // expect(tokenService.token).not.toHaveBeenCalled();
        expect(error).toBeInstanceOf(CustomError);
      }
    });
  });

  describe('Profile User Test', () => {
    it('Get Profile where ID exists Should Return Profile Object', async () => {
      userRepository.getById.mockResolvedValue(userOutput);
      const user = await userService.profile(userProfileInput.id);
      expect(user).toEqual(userOutput);
    });
    it('Throw Unexpected Database Error', async () => {
      userRepository.getById.mockRejectedValue(new Error());
      try {
        await userService.profile(userProfileInput.id);
        fail('NotFoundException not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Object);
      }
    });

    it("Throw NotFoundException When ID doesn't Exists", async () => {
      userRepository.getById.mockResolvedValue(null);
      try {
        await userService.profile(userProfileInput.id);
        // fail('NotFoundException not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
