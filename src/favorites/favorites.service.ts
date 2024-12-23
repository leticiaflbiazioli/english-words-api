import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite } from './favorites.schema';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name) private readonly favoriteModel: Model<Favorite>,
  ) {}

  async addFavorite(word: string, userId: string): Promise<Favorite> {
    const existingFavorite = await this.favoriteModel.findOne({ word, userId });

    if (existingFavorite) {
      return existingFavorite;
    }

    const newFavorite = new this.favoriteModel({ word, userId });
    return newFavorite.save();
  }

  async removeFavorite(
    word: string,
    userId: string,
  ): Promise<{ deleted: boolean }> {
    const result = await this.favoriteModel.deleteOne({ word, userId }).exec();

    return {
      deleted: result.deletedCount > 0,
    };
  }

  async getFavorites(userId: string, page: number = 1, limit: number = 10) {
    const results = await this.favoriteModel
      .find({ userId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ favoritedAt: -1 })
      .exec();

    const totalDocs = await this.favoriteModel.countDocuments({ userId });

    return {
      results,
      totalDocs,
      page,
      totalPages: Math.ceil(totalDocs / limit),
      hasNext: page * limit < totalDocs,
      hasPrev: page > 1,
    };
  }
}
