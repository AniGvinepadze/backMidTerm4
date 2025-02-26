import { IsNotEmpty, IsString, Length } from "class-validator";

 
 export class ChangePasswordDto{
    
    @IsNotEmpty()
    @IsString()
    currentPassword:string

    @IsString()
    @IsNotEmpty()
    @Length(6,20)
    newPassword:string
 }