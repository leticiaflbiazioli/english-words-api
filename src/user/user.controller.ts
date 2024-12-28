import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthInterceptor } from 'src/auth.interceptor';
import { FavoritesService } from 'src/favorites/favorites.service';
import { HistoryService } from 'src/history/history.service';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
@UseInterceptors(AuthInterceptor)
export class UserController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly favoritesService: FavoritesService,
    private readonly userService: UserService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obter o perfil do usuário' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário',
    schema: {
      example: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        history: [],
        favorites: [],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao obter o perfil do usuário',
  })
  async getProfile(@Req() req: any) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new HttpException(
        { message: 'O ID do usuário é obrigatório' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.findById(userId);

    const history = await this.historyService.getHistory(userId);

    const favorites = await this.favoritesService.getFavorites(userId);

    return {
      name: user.name,
      email: user.email,
      history: history.results,
      favorites: favorites.results,
    };
  }

  @Get('me/history')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obter o histórico do usuário' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Histórico do usuário',
    schema: {
      example: {
        results: [{ word: 'example', added: '2024-01-01' }],
        totalDocs: 10,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Erro ao obter o histórico' })
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
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obter os favoritos do usuário' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Favoritos do usuário',
    schema: {
      example: {
        results: [{ word: 'example', added: '2024-01-01' }],
        totalDocs: 10,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Erro ao obter os favoritos' })
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
