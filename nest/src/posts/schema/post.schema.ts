import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({timestamps:true})
export class Post {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'company' })
  company: mongoose.Schema.Types.ObjectId;
}

export const postSchema = SchemaFactory.createForClass(Post);
