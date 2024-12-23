import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SearchService {
  constructor(private readonly httpService: HttpService) {}

  async fetchWord(word: string): Promise<any> {
    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
      const response = await lastValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          'Erro ao buscar a palavra na API externa',
      );
    }
  }
}
