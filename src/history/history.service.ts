import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History } from './history.schema';

@Injectable()
export class HistoryService {
  constructor(@InjectModel('History') private historyModel: Model<History>) {}

  async saveSearch(word: string, userId: string): Promise<History> {
    const newSearch = new this.historyModel({ word, userId });
    return newSearch.save();
  }

  async getHistory(userId: string, page: number = 1, limit: number = 10) {
    const results = await this.historyModel
      .find({ userId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ visitedAt: -1 })
      .exec();

    const totalDocs = await this.historyModel.countDocuments({ userId });

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
