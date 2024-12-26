import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new HttpException(
        { message: 'Header de autorização ausente' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpException(
        { message: 'Autorização ausente' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
    } catch (error) {
      throw new HttpException(
        { message: 'Token inválido ou expirado' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return next.handle();
  }
}
