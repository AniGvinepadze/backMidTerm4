import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

export class EmployeeSignInDto {
  @IsNotEmpty()
  @IsEmail()
  firstName: string;

  @IsNotEmpty()
  @IsEmail()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEmail()
  @Length(6, 20)
  password: string;

  @IsNotEmpty()
  @IsString()
  otpCode: string;
}
