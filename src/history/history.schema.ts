import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class History extends Document {
  @Prop({ required: true })
  word: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, default: () => new Date() })
  searchedAt: Date;
}

export const HistorySchema = SchemaFactory.createForClass(History);
