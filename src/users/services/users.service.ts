import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserCreateReqDto, UserLoginReqDto } from '../dto';
import { UserRepository } from '../repository/users.repository';
import { TokenService } from '../../utils/token/services';
import { HashService } from '../../utils/hash/hash.service';
import { UserType } from '../../utils/token/types/user.enum';
import {
  CustomError,
  NotFoundException,
  translateTypeOrmError,
} from '../../core/errors';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { EntityManager, QueryFailedError } from 'typeorm';
import { OrderbookService } from '../../orderbook/services/orderbook.service';
import { errorMessages } from 'src/core/config/messages';
export interface IUserService {
  createUser(data: UserCreateReqDto): Promise<{ user: any; token: string }>;
  loginUser(data: UserLoginReqDto): Promise<{ user: any; token: string }>;
  profile(id: string): Promise<any>;
  updateFunds(id: string, funds: number, manager?: EntityManager): Promise<any>;
}
@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,

    private readonly logger: LoggerService,

    private readonly hashService: HashService,

    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => OrderbookService))
    private readonly orderBookService: OrderbookService,
  ) {}
  static logInfo = 'Service - User:';

  async createUser(data: UserCreateReqDto) {
    this.logger.info(
      `${UserService.logInfo} Create User with email: ${data.email}`,
    );
    data.password = await this.hashService.hash(data.password);
    try {
      const user = await this.userRepository.save(data);
      const token = {
        id: user.id,
        email: user.email,
        userType: UserType.USER,
      };
      this.logger.info(
        `${UserService.logInfo} Created User with email: ${data.email}`,
      );
      return {
        user: { ...user },
        token: `Bearer ${await this.tokenService.token(token)}`,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.warn(
          `${UserService.logInfo} Already Exists! User with email: ${data.email}`,
        );
        throw translateTypeOrmError(error);
      }
      this.logger.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${UserService.logInfo} ${error.message} for email: ${data.email}`,
      );
      throw error;
    }
  }

  async loginUser(data: UserLoginReqDto) {
    this.logger.info(
      `${UserService.logInfo} Login User with email: ${data.email}`,
    );
    try {
      const user = await this.userRepository.getByEmail(data.email);
      if (!user) {
        throw new CustomError(
          errorMessages.INCORRECT_CREDENTIALS,
          HttpStatus.UNAUTHORIZED,
        );
      }
      const isEqual = await this.hashService.compare(
        data.password,
        user.password,
      );
      if (!isEqual) {
        throw new CustomError(
          errorMessages.INCORRECT_CREDENTIALS,
          HttpStatus.UNAUTHORIZED,
        );
      }
      const token = {
        id: user.id,
        email: user.email,
        userType: UserType.USER,
      };
      this.logger.info(
        `${UserService.logInfo} LoggedIn User with email: ${data.email}`,
      );
      return {
        user: { ...user },
        token: `Bearer ${await this.tokenService.token(token)}`,
      };
    } catch (error) {
      this.logger.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${UserService.logInfo} ${error.message} for email: ${data.email}`,
      );
      throw error;
    }
  }

  async profile(id: string) {
    this.logger.info(`${UserService.logInfo} Find User Profile with id: ${id}`);
    try {
      const user = await this.userRepository.getById(id);
      if (!user) {
        this.logger.warn(
          `${UserService.logInfo} Not Found! User with id: ${id}`,
        );
        throw new NotFoundException();
      }
      this.logger.info(
        `${UserService.logInfo} Found User Profile with id: ${id}`,
      );
      return user;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.warn(`${UserService.logInfo} ${error.message} for id: ${id}`);
      throw error;
    }
  }

  async updateFunds(id: string, funds: number, manager?: EntityManager) {
    this.logger.info(
      `${UserService.logInfo} Update Funds for User with id: ${id}`,
    );
    try {
      if (!(await this.orderBookService.validateBalance(id, funds)))
        throw new CustomError(
          errorMessages.INSUFFICIENT_BALANCE,
          HttpStatus.BAD_REQUEST,
        );

      const user = await this.userRepository.getById(id);
      if (!user) {
        this.logger.warn(
          `${UserService.logInfo} Not Found! User with id: ${id}`,
        );
        throw new NotFoundException();
      }
      user.funds += funds;

      await this.userRepository.save(user, manager);
      this.logger.info(
        `${UserService.logInfo} Updated Funds for User with id: ${id}`,
      );
      return user;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.warn(`${UserService.logInfo} ${error.message} for id: ${id}`);
      throw error;
    }
  }
}
