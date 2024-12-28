import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService,
  ) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar login' })
  @ApiBody({
    description: 'Dados do usuário para login',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido',
    schema: { example: { id: 1, name: 'John Doe', token: 'jwt_token_here' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Credenciais inválidas',
  })
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
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiBody({
    description: 'Dados do usuário para o registro',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Registro bem-sucedido',
    schema: { example: { id: 1, name: 'John Doe', token: 'jwt_token_here' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao registrar o usuário',
  })
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
