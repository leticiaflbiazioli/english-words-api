import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthInterceptor } from 'src/auth.interceptor';
import { FavoritesService } from 'src/favorites/favorites.service';
import { HistoryService } from 'src/history/history.service';
import { SearchService } from 'src/search/search.service';
import { EntriesService } from './entries.service';

@ApiTags('entries')
@Controller('entries')
@UseInterceptors(AuthInterceptor)
export class EntriesController {
  constructor(
    private readonly entriesService: EntriesService,
    private readonly historyService: HistoryService,
    private readonly searchService: SearchService,
    private readonly favoritesService: FavoritesService,
  ) {}

  @Get('en')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar palavras' })
  @ApiQuery({
    name: 'search',
    required: true,
    type: String,
    description: 'Termo de busca',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite de resultados por página',
    default: 10,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
    default: 1,
  })
  @ApiResponse({ status: 200, description: 'Lista de palavras encontradas' })
  @ApiResponse({ status: 400, description: 'Erro na busca das palavras' })
  async getWords(
    @Query('search') search: string = '',
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
    @Res() res: Response,
  ) {
    const start = Date.now();

    const cleanPage = Math.max(page, 1);
    const { result } = await this.entriesService.findAll(
      search,
      limit,
      cleanPage,
    );
    const totalPages = Math.ceil(result.total / limit);
    const results = result.entries.map((entry) => entry.entry);

    const responseTime = Date.now() - start;
    res.setHeader('x-cache', result.fromCache ? 'HIT' : 'MISS');
    res.setHeader('x-response-time', responseTime);
    res.send({
      results,
      totalDocs: result.total,
      page: cleanPage,
      totalPages,
      hasNext: cleanPage < totalPages,
      hasPrev: cleanPage > 1,
    });
  }

  @Get('en/:word')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar uma palavra específica' })
  @ApiParam({
    name: 'word',
    type: String,
    description: 'Palavra a ser buscada',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações sobre a palavra',
    schema: { example: { word: 'example', data: {} } },
  })
  @ApiResponse({ status: 400, description: 'Erro ao buscar a palavra' })
  async searchWord(
    @Param('word') word: string = '',
    @Req() req: any,
    @Res() res: Response,
  ) {
    const start = Date.now();

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
      const { data, fromCache } = await this.searchService.fetchWord(word);

      const responseTime = Date.now() - start;
      res.setHeader('x-cache', fromCache ? 'HIT' : 'MISS');
      res.setHeader('x-response-time', responseTime);

      await this.historyService.saveSearch(word, userId);
      const isFavorite = await this.favoritesService.validateFavorite(
        word,
        userId,
      );

      res.send({ word, data, isFavorite });
    } catch (error) {
      throw new HttpException(
        { message: 'Erro ao buscar a palavra' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('en/:word/favorite')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Adicionar palavra aos favoritos' })
  @ApiParam({
    name: 'word',
    type: String,
    description: 'Palavra a ser adicionada aos favoritos',
  })
  @ApiResponse({
    status: 200,
    description: 'Palavra adicionada aos favoritos',
    schema: {
      example: { message: 'Palavra "example" adicionada aos favoritos' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao adicionar a palavra aos favoritos',
  })
  async favoriteWord(@Param('word') word: string, @Req() req: any) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new HttpException(
        { message: 'O ID do usuário é obrigatório' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const favorite = await this.favoritesService.addFavorite(word, userId);

    return {
      message: `Palavra '${word}' adicionada aos favoritos`,
    };
  }

  @Delete('en/:word/unfavorite')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Remover palavra dos favoritos' })
  @ApiParam({
    name: 'word',
    type: String,
    description: 'Palavra a ser removida dos favoritos',
  })
  @ApiResponse({
    status: 200,
    description: 'Palavra removida dos favoritos',
    schema: {
      example: { message: 'Palavra "example" removida dos favoritos' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao remover a palavra dos favoritos',
  })
  async unfavoriteWord(@Param('word') word: string, @Req() req: any) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new HttpException(
        { message: 'O ID do usuário é obrigatório' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { deleted } = await this.favoritesService.removeFavorite(
      word,
      userId,
    );

    if (!deleted) {
      throw new HttpException(
        { message: `Palavra '${word}' não encontrada na lista de favoritos` },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: `Palavra '${word}' removida dos favoritos`,
    };
  }
}
