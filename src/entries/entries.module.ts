import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { Favorite, FavoriteSchema } from 'src/favorites/favorites.schema';
import { FavoritesService } from 'src/favorites/favorites.service';
import { History, HistorySchema } from 'src/history/history.schema';
import { HistoryService } from 'src/history/history.service';
import { SearchService } from 'src/search/search.service';
import { EntriesController } from './entries.controller';
import { Entry, EntrySchema } from './entries.schema';
import { EntriesService } from './entries.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Entry.name, schema: EntrySchema }]),
    MongooseModule.forFeature([{ name: History.name, schema: HistorySchema }]),
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '10h' },
      }),
    }),
    CacheModule.register({ ttl: 1000 * 60 * 60, max: 100 }),
  ],
  providers: [
    EntriesService,
    JwtStrategy,
    HistoryService,
    SearchService,
    FavoritesService,
  ],
  controllers: [EntriesController],
})
export class EntriesModule {}
