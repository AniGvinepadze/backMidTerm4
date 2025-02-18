import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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
}
