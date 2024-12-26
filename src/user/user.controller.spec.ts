import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthInterceptor } from '../../src/auth.interceptor';
import { Favorite } from '../../src/favorites/favorites.schema';
import { History } from '../../src/history/history.schema';
import { FavoritesService } from '../favorites/favorites.service';
import { HistoryService } from '../history/history.service';
import { UserController } from './user.controller';
import { User } from './user.schema';
import { UserService } from './user.service';

describe('UserController', () => {
  let userController: UserController;
  let historyService: HistoryService;
  let favoritesService: FavoritesService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: HistoryService,
          useValue: {
            getHistory: jest.fn(),
          },
        },
        {
          provide: FavoritesService,
          useValue: {
            getFavorites: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    })
      .overrideInterceptor(AuthInterceptor)
      .useValue({
        intercept: jest.fn((context, next) => next.handle()),
      })
      .compile();

    userController = module.get<UserController>(UserController);
    historyService = module.get<HistoryService>(HistoryService);
    favoritesService = module.get<FavoritesService>(FavoritesService);
    userService = module.get<UserService>(UserService);
  });

  describe('getProfile', () => {
    it('should return user profile with history and favorites', async () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      } as User;
      const mockHistory = {
        results: [{ word: 'test', searchedAt: new Date() }] as History[],
        totalDocs: 10,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
      const mockFavorites = {
        results: [{ word: 'favorite', favoritedAt: new Date() }] as Favorite[],
        totalDocs: 10,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };

      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(historyService, 'getHistory').mockResolvedValue(mockHistory);
      jest
        .spyOn(favoritesService, 'getFavorites')
        .mockResolvedValue(mockFavorites);

      const result = await userController.getProfile({
        user: { sub: '1' },
      });

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        history: mockHistory.results,
        favorites: mockFavorites.results,
      });

      expect(userService.findById).toHaveBeenCalledWith('1');
      expect(historyService.getHistory).toHaveBeenCalledWith('1');
      expect(favoritesService.getFavorites).toHaveBeenCalledWith('1');
    });

    it('should throw an error if userId is not provided', async () => {
      await expect(userController.getProfile({ user: null })).rejects.toThrow(
        HttpException,
      );

      expect(userService.findById).not.toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return user history with pagination', async () => {
      const mockHistory = {
        results: [{ word: 'example', searchedAt: new Date() }] as History[],
        totalDocs: 10,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };

      jest.spyOn(historyService, 'getHistory').mockResolvedValue(mockHistory);

      const result = await userController.getHistory({
        user: { sub: '1' },
        query: { page: 1, limit: 10 },
      });

      expect(result).toEqual({
        results: mockHistory.results.map((item) => ({
          word: item.word,
          added: item.searchedAt,
        })),
        totalDocs: mockHistory.totalDocs,
        page: mockHistory.page,
        totalPages: mockHistory.totalPages,
        hasNext: mockHistory.hasNext,
        hasPrev: mockHistory.hasPrev,
      });

      expect(historyService.getHistory).toHaveBeenCalledWith('1', 1, 10);
    });

    it('should throw an error if userId is not provided', async () => {
      await expect(
        userController.getHistory({ user: null, query: {} }),
      ).rejects.toThrow(HttpException);

      expect(historyService.getHistory).not.toHaveBeenCalled();
    });
  });

  describe('getFavorites', () => {
    it('should return user favorites with pagination', async () => {
      const mockFavorites = {
        results: [{ word: 'favorite', favoritedAt: new Date() }] as Favorite[],
        totalDocs: 10,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };

      jest
        .spyOn(favoritesService, 'getFavorites')
        .mockResolvedValue(mockFavorites);

      const result = await userController.getFavorites({
        user: { sub: '1' },
        query: { page: 1, limit: 10 },
      });

      expect(result).toEqual({
        results: mockFavorites.results.map((item) => ({
          word: item.word,
          added: item.favoritedAt,
        })),
        totalDocs: mockFavorites.totalDocs,
        page: mockFavorites.page,
        totalPages: mockFavorites.totalPages,
        hasNext: mockFavorites.hasNext,
        hasPrev: mockFavorites.hasPrev,
      });

      expect(favoritesService.getFavorites).toHaveBeenCalledWith('1', 1, 10);
    });

    it('should throw an error if userId is not provided', async () => {
      await expect(
        userController.getFavorites({ user: null, query: {} }),
      ).rejects.toThrow(HttpException);

      expect(favoritesService.getFavorites).not.toHaveBeenCalled();
    });
  });
});
