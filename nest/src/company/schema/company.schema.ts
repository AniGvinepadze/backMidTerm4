import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Role } from 'src/enums/role.enum';
import { Subscription } from 'src/enums/subscription.enum';

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

  @Prop({ type: String, enum: Role, default: Role.USER })
  role: string;

  @Prop({ type: String, enum: Subscription, default: Subscription.FREE_TIER })
  subscriptionPlan: string;

  @Prop({ type: Number, default: 0 })
  crudCount: number;

  @Prop({ type: Number, default: 0 })
  employesCount: number;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'post', default: [] })
  posts: mongoose.Schema.Types.ObjectId[];
  
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'file', default: [] })
  file: mongoose.Schema.Types.ObjectId[];


  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: String })
  otpCode: string;

  @Prop({ type: Date })
  otpCodeValidateDate: Date;
}

export const companySchema = SchemaFactory.createForClass(Company);
