import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Favorite extends Document {
  @Prop({ required: true })
  word: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, default: () => new Date() })
  favoritedAt: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
