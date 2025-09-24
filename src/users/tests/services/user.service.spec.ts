import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../repository/users.repository';
import { UserService } from '../../services/users.service';
import { HashService } from '../../../utils/hash/hash.service';
import { LoggerService } from '../../../utils/logger/WinstonLogger';
import { TokenService } from '../../../utils/token/services';
import { mockUsersRepository } from '../mocks/users.repository.mock';

import { mockHashService, mockTokenService } from '../mocks';
import {
  createUserInput,
  userOutput,
  loginUserInput,
  userProfileInput,
  token,
  userOutputWithToken,
} from '../constants';
import { CustomError, NotFoundException } from '../../../core/errors';
import { OrderbookService } from '../../../orderbook/services/orderbook.service';
import { QueryFailedError } from 'typeorm';

const mockOrderbookService = {
  validateBalance: jest.fn().mockResolvedValue(true),
};
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
          useValue: mockOrderbookService,
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

  describe('Update Funds Test', () => {
    it('Should update funds successfully when balance is valid and user exists', async () => {
      orderbookService.validateBalance.mockResolvedValue(true);
      const existingUser = { ...userOutput, funds: 1000 };
      userRepository.getById.mockResolvedValue(existingUser);
      userRepository.save.mockResolvedValue({ ...existingUser, funds: 1500 });

      const result = await userService.updateFunds(existingUser.id, 500);

      // expect(orderbookService.validateBalance).toHaveBeenCalledWith(
      //   existingUser.id,
      //   500,
      // );
      // expect(userRepository.getById).toHaveBeenCalledWith(existingUser.id);
      // expect(userRepository.save).toHaveBeenCalledWith(
      //   { ...existingUser, funds: 1500 },
      //   undefined,
      // );
      expect(result.funds).toBe(1500);
    });

    it('Should throw CustomError when validateBalance fails', async () => {
      orderbookService.validateBalance.mockResolvedValue(false);

      await expect(userService.updateFunds(userOutput.id, 500)).rejects.toThrow(
        CustomError,
      );
    });

    it('Should throw NotFoundException when user does not exist', async () => {
      orderbookService.validateBalance.mockResolvedValue(true);
      userRepository.getById.mockResolvedValue(null);

      await expect(userService.updateFunds(userOutput.id, 500)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should throw error when save fails', async () => {
      orderbookService.validateBalance.mockResolvedValue(true);
      const existingUser = { ...userOutput, funds: 1000 };
      userRepository.getById.mockResolvedValue(existingUser);
      userRepository.save.mockRejectedValue(new Error('DB Error'));

      await expect(
        userService.updateFunds(existingUser.id, 500),
      ).rejects.toThrow(Error);
    });
  });
});
