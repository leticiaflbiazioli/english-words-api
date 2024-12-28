import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History } from './history.schema';

interface HistoryResult {
  results: History[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class HistoryService {
  constructor(@InjectModel('History') private historyModel: Model<History>) {}

  async saveSearch(word: string, userId: string): Promise<History> {
    const newSearch = new this.historyModel({ word, userId });
    return newSearch.save();
  }

  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<HistoryResult> {
    const [results, totalDocs] = await Promise.all([
      this.historyModel
        .find({ userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ added: -1 })
        .exec(),

      this.historyModel.countDocuments({ userId }),
    ]);

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
