import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AuthInterceptor } from 'src/auth.interceptor';
import { FavoritesService } from 'src/favorites/favorites.service';
import { HistoryService } from 'src/history/history.service';

@Controller('user')
@UseInterceptors(AuthInterceptor)
export class UserController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly favoritesService: FavoritesService,
  ) {}

  @Get('me')
  async getProfile(@Req() req: any) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new HttpException(
        { message: 'O ID do usuário é obrigatório' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return { userId, message: 'Perfil do usuário' };
  }

  @Get('me/history')
  async getHistory(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException(
        { message: 'O ID do usuário é obrigatório' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const history = await this.historyService.getHistory(userId, page, limit);
    const results = history.results.map((item) => {
      return { word: item.word, added: item.searchedAt };
    });
    return {
      results,
      totalDocs: history.totalDocs,
      page: history.page,
      totalPages: history.totalPages,
      hasNext: history.hasNext,
      hasPrev: history.hasPrev,
    };
  }

  @Get('me/favorites')
  async getFavorites(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException(
        { message: 'O ID do usuário é obrigatório' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const favorites = await this.favoritesService.getFavorites(
      userId,
      page,
      limit,
    );
    const results = favorites.results.map((item) => {
      return { word: item.word, added: item.favoritedAt };
    });
    return {
      results,
      totalDocs: favorites.totalDocs,
      page: favorites.page,
      totalPages: favorites.totalPages,
      hasNext: favorites.hasNext,
      hasPrev: favorites.hasPrev,
    };
  }
}
