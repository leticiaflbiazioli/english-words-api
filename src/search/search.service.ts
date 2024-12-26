import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { lastValueFrom } from 'rxjs';

interface SearchResponse {
  fromCache: boolean;
  data: any;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async fetchWord(word: string): Promise<SearchResponse> {
    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

      const cacheKey = `search:${word}`;
      const cachedData = await this.cacheManager.get(cacheKey);

      if (cachedData) {
        return { fromCache: true, data: cachedData };
      }

      const response = await lastValueFrom(this.httpService.get(url));

      await this.cacheManager.set(cacheKey, response.data, 1000 * 60 * 60);

      return { fromCache: false, data: response.data };
    } catch (error) {
      throw new HttpException(
        { message: 'Erro ao buscar a palavra na API externa' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
