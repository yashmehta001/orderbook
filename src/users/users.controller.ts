import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
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

@ApiTags('User')
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Auth(AuthType.None)
  @Serialize(UserLoginResDto)
  @ApiResponse({
    description: 'for more information please check UserCreateReqDto schema',
  })
  @ApiOkResponse({
    description:
      'When user registration successfully then this response will receive',
    type: UserLoginResDto,
  })
  @ApiBadRequestResponse({
    description: 'when user email is already taken',
  })
  @HttpCode(HttpStatus.OK)
  @Post('/signup')
  async signUp(@Body() body: UserCreateReqDto) {
    return this.userService.createUser(body);
  }

  @Auth(AuthType.None)
  @Serialize(UserLoginResDto)
  @ApiResponse({
    description: 'for more information please check UserLoginReqDto schema',
  })
  @ApiOkResponse({
    description: 'When user login successfully then this response will receive',
    type: UserLoginResDto,
  })
  @ApiBadRequestResponse({
    description:
      'when user email or password is wrong or user account is ban from admin',
  })
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() body: UserLoginReqDto) {
    return this.userService.loginUser(body);
  }

  @Serialize(UserProfileResDto)
  @ApiResponse({
    description: 'for more information please check UserLoginReqDto schema',
  })
  @ApiOkResponse({
    description:
      'When user profile is successfully retrieved then this response will receive',
    type: UserProfileResDto,
  })
  @ApiBadRequestResponse({
    description: 'when user not found',
  })
  @ApiBearerAuth()
  @Get('/profile')
  async profile(@AuthUser() user: UserProfileReqDto) {
    return this.userService.profile(user);
  }
}
