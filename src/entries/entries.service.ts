import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { Entry } from './entries.schema';

export interface ResultEntries {
  entries: Entry[];
  total: number;
  fromCache: boolean;
}

@Injectable()
export class EntriesService {
  constructor(
    @InjectModel('Entry') private entryModel: Model<Entry>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(
    search: string,
    limit: number,
    page: number,
  ): Promise<{ result: ResultEntries }> {
    const skip = (page - 1) * limit;

    const filter = search ? { entry: new RegExp(search, 'i') } : {};

    const cacheKey = `entries:${search}:${limit}:${page}`;
    const cachedData = await this.cacheManager.get<ResultEntries>(cacheKey);

    if (cachedData) {
      return {
        result: {
          entries: cachedData.entries,
          total: cachedData.total,
          fromCache: true,
        },
      };
    }

    const [entries, total] = await Promise.all([
      this.entryModel.find(filter).skip(skip).limit(limit).exec(),
      this.entryModel.countDocuments(filter).exec(),
    ]);

    const result = { entries, total };

    await this.cacheManager.set(cacheKey, result, 1000 * 60 * 60);

    return { result: { entries, total, fromCache: false } };
  }
}
