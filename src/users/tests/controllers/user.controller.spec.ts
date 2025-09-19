import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../users.controller';
import { UserService } from '../../services/users.service';
import { mockUserService } from '../mocks';
import {
  invalidEmailInputCreate,
  invalidInputLogin,
  invalidUserProfileInput,
  userOutput,
  userOutputWithToken,
  userProfileInput,
  validInputCreate,
  validInputLogin,
} from '../constants';

describe('User Controller', () => {
  let userService;
  let usersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersController,
        {
          provide: UserService,
          useFactory: mockUserService,
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    usersController = module.get<UsersController>(UsersController);
  });
  it('UserController should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('User Create', () => {
    it('Valid User details should return valid response', async () => {
      userService.createUser.mockReturnValue(userOutputWithToken);
      const user = await usersController.signUp(validInputCreate);
      expect(user).toEqual(userOutputWithToken);
    });
    it('Invalid firstName should throw Validation Error', async () => {
      try {
        await usersController.signUp(invalidEmailInputCreate);
        fail('ReferenceError is not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ReferenceError);
      }
    });
  });

  describe('User login', () => {
    it('Valid User details should return valid response', async () => {
      userService.loginUser.mockReturnValue(userOutputWithToken);
      const user = await usersController.login(validInputLogin);
      expect(user).toEqual(userOutputWithToken);
    });
    it('Invalid email should throw Validation Error', async () => {
      try {
        await usersController.login(invalidInputLogin);
        fail('ReferenceError is not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ReferenceError);
      }
    });
  });

  describe('User Pofile', () => {
    it('Valid User Header should return valid response', async () => {
      userService.profile.mockReturnValue(userOutput);
      const user = await usersController.profile(userProfileInput);
      expect(user).toEqual(userOutput);
    });
    it('Invalid email should throw Validation Error', async () => {
      try {
        await usersController.profile(invalidUserProfileInput);
        fail('ReferenceError is not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ReferenceError);
      }
    });
  });
});
