import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  UserCreateReqDto,
  UserLoginReqDto,
  UserLoginResDto,
  UserProfileReqDto,
  UserProfileResDto,
} from './dto/index';
import { Serialize } from '../utils/loaders/SerializeDto';
import { UserService } from './services/users.service';
import { AuthType } from '../utils/token/types';
import { Auth } from '../utils/authentication/decorator';
import { AuthUser } from '../utils/decorators';
import { successMessages } from '../core/config';
import { UserEntity } from './entities';

@ApiTags('User')
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Auth(AuthType.None)
  @Serialize(UserLoginResDto, successMessages.USER_CREATED)
  @ApiResponse({
    description: 'for more information please check UserCreateReqDto schema',
  })
  @ApiCreatedResponse({
    description:
      'This response is returned when user registration is successful.',
    type: UserLoginResDto,
  })
  @ApiConflictResponse({
    description: 'Returned when the user email is already taken.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/signup')
  async signUp(@Body() body: UserCreateReqDto): Promise<UserLoginResDto> {
    return this.userService.createUser(body);
  }

  @Auth(AuthType.None)
  @Serialize(UserLoginResDto, successMessages.USER_LOGGED_IN)
  @ApiResponse({
    description: 'for more information please check UserLoginReqDto schema',
  })
  @ApiOkResponse({
    description: 'This response is returned upon successful user login.',
    type: UserLoginResDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'This response is returned if the email or password is incorrect, the email does not exist, or the user account has been banned by an administrator or does not exist.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() body: UserLoginReqDto): Promise<UserLoginResDto> {
    return this.userService.loginUser(body);
  }

  @Serialize(UserProfileResDto)
  @ApiResponse({
    description: 'for more information please check UserLoginReqDto schema',
  })
  @ApiOkResponse({
    description:
      'This response is returned when user profile is successfully retrieved.',
    type: UserProfileResDto,
  })
  @ApiNotFoundResponse({
    description: 'This response is returned when user is not found.',
  })
  @ApiBearerAuth()
  @Get('/profile')
  async profile(
    @AuthUser() user: UserProfileReqDto,
  ): Promise<UserEntity | null> {
    return this.userService.profile(user.id);
  }
}
