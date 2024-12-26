import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserService } from '../../src/user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService,
  ) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    try {
      const user = await this.authService.validateUser(
        body.email,
        body.password,
      );
      const loginUser = await this.authService.login(user);
      return {
        id: user.id,
        name: user.name,
        token: loginUser.token,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.response.message,
        },
        error.status,
      );
    }
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() body: { name: string; email: string; password: string },
  ) {
    try {
      const savedUser = await this.usersService.create(
        body.name,
        body.email,
        body.password,
      );
      const loginData = await this.authService.login(savedUser);
      return {
        id: savedUser.id,
        name: savedUser.name,
        token: loginData.token,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.response.message,
        },
        error.status,
      );
    }
  }
}
