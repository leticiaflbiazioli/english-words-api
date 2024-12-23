import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { Favorite, FavoriteSchema } from 'src/favorites/favorites.schema';
import { FavoritesService } from 'src/favorites/favorites.service';
import { History, HistorySchema } from 'src/history/history.schema';
import { HistoryService } from 'src/history/history.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
  ],
  controllers: [UserController],
  providers: [UserService, FavoritesService, HistoryService, JwtStrategy],
  exports: [UserService],
})
export class UsersModule {}
