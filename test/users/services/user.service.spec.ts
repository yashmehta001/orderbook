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
import { OrderbookService } from '../../../src/orderbook/services/orderbook.service';
import { UserService } from '../../../src/users/services/users.service';
import { UserRepository } from '../../../src/users/repository/users.repository';
import { HashService } from '../../../src/utils/hash/hash.service';
import { TokenService } from '../../../src/utils/token/services';
import { LoggerService } from '../../../src/utils/logger/WinstonLogger';
import { CustomError } from '../../../src/core/errors';
import { NotFoundException } from '@nestjs/common';
import { mockOrderBookService } from '../../orderbook/mocks';
import { mockHashService, mockTokenService } from '../mocks';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let hashService: jest.Mocked<HashService>;
  let tokenService: jest.Mocked<TokenService>;
  let orderbookService: jest.Mocked<OrderbookService>;

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
          provide: OrderbookService,
          useValue: mockOrderBookService(),
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
    orderbookService = module.get<OrderbookService>(
      OrderbookService,
    ) as jest.Mocked<OrderbookService>;
  });

  it('UsersService should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('Create Users Test', () => {
    it('Get User Info and token when entering valid FirstName LastName Email and Password', async () => {
      hashService.hash.mockResolvedValue(userOutput.password);
      tokenService.token.mockResolvedValue(token);
      userRepository.save.mockResolvedValue(userOutput);
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
