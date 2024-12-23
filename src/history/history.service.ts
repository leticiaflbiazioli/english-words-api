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
}
