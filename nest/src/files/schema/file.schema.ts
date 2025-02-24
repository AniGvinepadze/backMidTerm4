import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class File {
  @Prop({ type: String })
  filePath: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
  })
  employee: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
  })
  company: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'employee',
    default: [],
  })
  view: mongoose.Schema.Types.ObjectId[];
}

export const fileSchema = SchemaFactory.createForClass(File)