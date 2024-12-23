import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Entry } from './entries.schema';

@Injectable()
export class EntriesService {
  constructor(@InjectModel('Entry') private entryModel: Model<Entry>) {}

  async findAll(
    search: string,
    limit: number,
    page: number,
  ): Promise<{ entries: Entry[]; total: number }> {
    const skip = (page - 1) * limit;

    const filter = search ? { entry: new RegExp(search, 'i') } : {};

    const [entries, total] = await Promise.all([
      this.entryModel.find(filter).skip(skip).limit(limit).exec(),
      this.entryModel.countDocuments(filter).exec(),
    ]);

    return { entries, total };
  }
}
