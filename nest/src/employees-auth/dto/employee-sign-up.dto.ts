import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class EmployeeSignUpDto {
  // @IsNotEmpty()
  // @IsString()
  // firstName: string;

  // @IsNotEmpty()
  // @IsString()
  // lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  // @IsNotEmpty()
  // @IsString()
  // @Length(6, 20)
  // password: string;
}
