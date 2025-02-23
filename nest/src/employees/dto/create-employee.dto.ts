import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  firstName: String;

  @IsNotEmpty()
  @IsString()
  lastName: String;

  @IsNotEmpty()
  @IsEmail()
  email: String;

  @IsNotEmpty()
  @IsString()
  @Length(6,20)
  passowrd: String;
}
