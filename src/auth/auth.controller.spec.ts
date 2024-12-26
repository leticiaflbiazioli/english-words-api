import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../src/user/user.schema';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('login', () => {
    it('should return user data with token when credentials are valid', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      const mockToken = { token: 'valid.jwt.token' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue(mockToken);

      const result = await authController.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        token: 'valid.jwt.token',
      });

      expect(authService.validateUser).toHaveBeenCalledWith(
        'john@example.com',
        'password123',
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw an error if authentication fails', async () => {
      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValue(
          new HttpException(
            { message: 'Invalid credentials' },
            HttpStatus.UNAUTHORIZED,
          ),
        );

      await expect(
        authController.login({
          email: 'invalid@example.com',
          password: '1234',
        }),
      ).rejects.toThrow(HttpException);

      expect(authService.validateUser).toHaveBeenCalledWith(
        'invalid@example.com',
        '1234',
      );
    });
  });

  describe('register', () => {
    it('should create a user and return user data with token', async () => {
      const mockUser = {
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
      } as User;
      const mockToken = { token: 'new.jwt.token' };

      jest.spyOn(userService, 'create').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue(mockToken);

      const result = await authController.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        id: '1',
        name: 'Jane Doe',
        token: 'new.jwt.token',
      });

      expect(userService.create).toHaveBeenCalledWith(
        'Jane Doe',
        'jane@example.com',
        'password123',
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw an error if user creation fails', async () => {
      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(
          new HttpException(
            { message: 'User already exists' },
            HttpStatus.BAD_REQUEST,
          ),
        );

      await expect(
        authController.register({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(HttpException);

      expect(userService.create).toHaveBeenCalledWith(
        'Jane Doe',
        'jane@example.com',
        'password123',
      );
    });
  });
});
