import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../repository/users.repository';
import { UserService } from '../../services/users.service';
import { HashService } from '../../../utils/hash/hash.service';
import { LoggerService } from '../../../utils/logger/WinstonLogger';
import { TokenService } from '../../../utils/token/services';
import { mockUsersRepository } from '../mocks/users.repository.mock';
import {
  NotFoundException,
  authFailedException,
  emailExistsException,
} from '../../errors';
import { mockHashService, mockTokenService } from '../mocks';
import {
  createUserInput,
  userOutput,
  loginUserInput,
  userProfileInput,
  token,
  userOutputWithToken,
} from '../constants';

describe('UserService', () => {
  let userService: UserService;
  let userRepository;
  let hashService;
  let tokenService;

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
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    hashService = module.get<HashService>(HashService);
    tokenService = module.get<TokenService>(TokenService);
  });

  it('UsersService should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('Create Users Test', () => {
    it('Get User Info and token when entering valid FirstName LastName Email and Password', async () => {
      hashService.hash.mockReturnValue(userOutput.password);
      tokenService.token.mockReturnValue(token);
      userRepository.save.mockReturnValue(userOutput);
      const user = await userService.createUser(createUserInput);

      expect(tokenService.token).toHaveBeenCalled();
      expect(user).toEqual(userOutputWithToken);
    });

    it('Throw emailExistsException when entering dublicate email', async () => {
      const duplicateKeyError = { code: '23505' };
      userRepository.save.mockRejectedValue(duplicateKeyError);
      try {
        await userService.createUser(createUserInput);
      } catch (error) {
        expect(tokenService.token).not.toHaveBeenCalled();
        expect(error).toBeInstanceOf(emailExistsException);
      }
    });
  });

  describe('Login User Test', () => {
    it('Get User Info and token when entering valid Email and Password', async () => {
      userRepository.getByEmail.mockReturnValue(userOutput);
      hashService.compare.mockReturnValue(true);
      tokenService.token.mockReturnValue(token);
      const User = await userService.loginUser(loginUserInput);
      expect(tokenService.token).toHaveBeenCalled();
      expect(User).toEqual(userOutputWithToken);
    });

    it('Throw authFailedException when entering valid Email and Invalid Password', async () => {
      userRepository.getByEmail.mockReturnValue(userOutput);
      hashService.compare.mockReturnValue(false);
      try {
        await userService.loginUser(loginUserInput);
      } catch (error) {
        expect(tokenService.token).not.toHaveBeenCalled();
        expect(error).toBeInstanceOf(authFailedException);
      }
    });

    it('Throw authFailedException when entering Invalid Email and Password', async () => {
      userRepository.getByEmail.mockRejectedValue(new NotFoundException());
      try {
        await userService.loginUser(loginUserInput);
      } catch (error) {
        expect(hashService.compare).not.toHaveBeenCalled();
        expect(tokenService.token).not.toHaveBeenCalled();
        expect(error).toBeInstanceOf(authFailedException);
      }
    });
  });

  describe('Profile User Test', () => {
    it('Get Profile where ID exists Should Return Profile Object', async () => {
      userRepository.getById.mockReturnValue(userOutput);
      const user = await userService.profile(userProfileInput);
      expect(user).toEqual(userOutput);
    });
    it('Throw NotFoundException When ID Doesnt Exists', async () => {
      userRepository.getById.mockRejectedValue(new NotFoundException());
      try {
        await userService.profile(userProfileInput);
        fail('NotFoundException not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
