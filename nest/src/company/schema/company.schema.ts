import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Company {
  @Prop({ type: String })
  companyName: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  industry: string;

//   @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'post', default: [] })
//   posts: mongoose.Schema.Types.ObjectId[];
}

export const companySchema = SchemaFactory.createForClass(Company);
