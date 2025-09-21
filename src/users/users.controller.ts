import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
  ManageFundsReqDto,
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
  @Serialize(UserLoginResDto, 'User Created')
  @ApiResponse({
    description: 'for more information please check UserCreateReqDto schema',
  })
  @ApiCreatedResponse({
    description:
      'When user registration successfully then this response will receive',
    type: UserLoginResDto,
  })
  @ApiConflictResponse({
    description: 'when user email is already taken',
  })
  @HttpCode(HttpStatus.CREATED)
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
  @ApiUnauthorizedResponse({
    description:
      'when user email or password is incorrect, email not found or user account is ban from admin',
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
  @ApiNotFoundResponse({
    description: 'when user not found',
  })
  @ApiBearerAuth()
  @Get('/profile')
  async profile(@AuthUser() user: UserProfileReqDto) {
    return this.userService.profile(user.id);
  }

  @Serialize(UserProfileResDto)
  @ApiResponse({
    description: 'for more information please check ManageFundsReqDto schema',
  })
  @ApiOkResponse({
    description: 'Funds are updated successfully',
    type: UserProfileResDto,
  })
  @ApiBadRequestResponse({
    description: 'insufficient funds',
  })
  @ApiNotFoundResponse({
    description: 'when user not found',
  })
  @ApiBearerAuth()
  @Put('/update-funds')
  async updateFunds(
    @AuthUser() user: UserProfileReqDto,
    @Body() body: ManageFundsReqDto,
  ) {
    return this.userService.updateFunds(user.id, body.funds);
  }
}
