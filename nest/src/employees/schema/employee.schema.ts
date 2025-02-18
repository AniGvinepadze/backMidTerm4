import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class Employee {
    @Prop({type:String})
    firstName:string

    @Prop({type:String})
    lastName:string

    @Prop({type:String})
    email:string
}

export const employeeSchema = SchemaFactory.createForClass(Employee)