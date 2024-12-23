import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AuthInterceptor } from 'src/auth.interceptor';
import { HistoryService } from 'src/history/history.service';
import { SearchService } from 'src/search/search.service';
import { EntriesService } from './entries.service';

@Controller('entries')
@UseInterceptors(AuthInterceptor)
export class EntriesController {
  constructor(
    private readonly entriesService: EntriesService,
    private readonly historyService: HistoryService,
    private readonly searchService: SearchService,
  ) {}

  @Get('en')
  async getWords(
    @Query('search') search: string = '',
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
  ) {
    const cleanPage = Math.max(page, 1);
    const { entries, total } = await this.entriesService.findAll(
      search,
      limit,
      cleanPage,
    );
    const totalPages = Math.ceil(total / limit);
    const results = entries.map((entry) => entry.entry);
    return {
      results,
      totalDocs: total,
      page: cleanPage,
      totalPages,
      hasNext: cleanPage < totalPages,
      hasPrev: cleanPage > 1,
    };
  }

  @Get('en/:word')
  async searchWord(@Param('word') word: string = '', @Req() req: any) {
    if (!word) {
      throw new HttpException(
        { message: 'A palavra é obrigatória' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userId = req.user?.sub;

    if (!userId) {
      throw new HttpException(
        { message: 'O ID do usuário é obrigatório' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const data = await this.searchService.fetchWord(word);

      await this.historyService.saveSearch(word, userId);

      return { word, data };
    } catch (error) {
      throw new HttpException(
        { message: 'Erro ao buscar a palavra' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}