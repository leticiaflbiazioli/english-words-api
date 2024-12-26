import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthInterceptor } from '../../src/auth.interceptor';
import { FavoritesService } from '../favorites/favorites.service';
import { HistoryService } from '../history/history.service';
import { SearchService } from '../search/search.service';
import { EntriesController } from './entries.controller';
import { Entry } from './entries.schema';
import { EntriesService } from './entries.service';

describe('EntriesController', () => {
  let controller: EntriesController;
  let entriesService: EntriesService;
  let historyService: HistoryService;
  let searchService: SearchService;
  let favoritesService: FavoritesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntriesController],
      providers: [
        {
          provide: EntriesService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: HistoryService,
          useValue: {
            saveSearch: jest.fn(),
          },
        },
        {
          provide: SearchService,
          useValue: {
            fetchWord: jest.fn(),
          },
        },
        {
          provide: FavoritesService,
          useValue: {
            addFavorite: jest.fn(),
            removeFavorite: jest.fn(),
          },
        },
      ],
    })
      .overrideInterceptor(AuthInterceptor)
      .useValue({
        intercept: jest.fn((context, next) => next.handle()),
      })
      .compile();

    controller = module.get<EntriesController>(EntriesController);
    entriesService = module.get<EntriesService>(EntriesService);
    historyService = module.get<HistoryService>(HistoryService);
    searchService = module.get<SearchService>(SearchService);
    favoritesService = module.get<FavoritesService>(FavoritesService);
  });

  describe('getWords', () => {
    it('should return paged words', async () => {
      const mockResult = {
        result: {
          entries: [{ entry: 'word1' }, { entry: 'word2' }] as Entry[],
          total: 2,
          fromCache: false,
        },
      };
      jest.spyOn(entriesService, 'findAll').mockResolvedValue(mockResult);

      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.getWords('', 10, 1, mockResponse as any);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('x-cache', 'MISS');
      expect(mockResponse.send).toHaveBeenCalledWith({
        results: ['word1', 'word2'],
        totalDocs: 2,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe('searchWord', () => {
    it('should throw error if word is not provided', async () => {
      await expect(
        controller.searchWord('', { user: { sub: '123' } }, {} as any),
      ).rejects.toThrow(HttpException);
    });

    it('must search for a word and save it in the history', async () => {
      const mockData = { definition: 'example' };
      jest.spyOn(searchService, 'fetchWord').mockResolvedValue({
        data: mockData,
        fromCache: false,
      });
      jest.spyOn(historyService, 'saveSearch').mockResolvedValue(undefined);

      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.searchWord(
        'example',
        { user: { sub: '123' } },
        mockResponse as any,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('x-cache', 'MISS');
      expect(mockResponse.send).toHaveBeenCalledWith({
        word: 'example',
        data: mockData,
      });
      expect(historyService.saveSearch).toHaveBeenCalledWith('example', '123');
    });

    it('should throw error if user is not authenticated when searching a word', async () => {
      await expect(
        controller.searchWord('example', { user: null }, {} as any),
      ).rejects.toThrow(HttpException);
    });

    it('should handle errors thrown by fetchWord and return appropriate HttpException', async () => {
      jest
        .spyOn(searchService, 'fetchWord')
        .mockRejectedValue(new Error('Fetch failed'));

      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await expect(
        controller.searchWord(
          'example',
          { user: { sub: '123' } },
          mockResponse as any,
        ),
      ).rejects.toThrowError(
        new HttpException(
          { message: 'Erro ao buscar a palavra' },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(searchService.fetchWord).toHaveBeenCalledWith('example');
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
      expect(historyService.saveSearch).not.toHaveBeenCalled();
    });
  });

  describe('favoriteWord', () => {
    it('must add a word to favorites', async () => {
      jest.spyOn(favoritesService, 'addFavorite').mockResolvedValue(undefined);

      const result = await controller.favoriteWord('example', {
        user: { sub: '123' },
      });

      expect(favoritesService.addFavorite).toHaveBeenCalledWith(
        'example',
        '123',
      );
      expect(result).toEqual({
        message: `Palavra 'example' adicionada aos favoritos`,
      });
    });

    it('should throw error if user is not authenticated when trying to add a new favorite', async () => {
      await expect(
        controller.favoriteWord('example', { user: null }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('unfavoriteWord', () => {
    it('should remove a word from favorites', async () => {
      jest
        .spyOn(favoritesService, 'removeFavorite')
        .mockResolvedValue({ deleted: true });

      const result = await controller.unfavoriteWord('example', {
        user: { sub: '123' },
      });

      expect(favoritesService.removeFavorite).toHaveBeenCalledWith(
        'example',
        '123',
      );
      expect(result).toEqual({
        message: `Palavra 'example' removida dos favoritos`,
      });
    });

    it('should throw error if word is not in favorites', async () => {
      jest
        .spyOn(favoritesService, 'removeFavorite')
        .mockResolvedValue({ deleted: false });

      await expect(
        controller.unfavoriteWord('example', { user: { sub: '123' } }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if user is not authenticated when trying to remove a favorite', async () => {
      await expect(
        controller.unfavoriteWord('example', { user: null }),
      ).rejects.toThrow(HttpException);
    });
  });
});
