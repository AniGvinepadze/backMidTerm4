import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { mongo } from 'mongoose';

@Schema()
export class Employee {
  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: String })
  email: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'company',
  
  })
  company: mongoose.Schema.Types.ObjectId[];
}

export const employeeSchema = SchemaFactory.createForClass(Employee);
