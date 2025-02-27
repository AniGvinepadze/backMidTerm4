import { Bind, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EmployeesAuthService } from './employees-auth.service';
import { EmployeeSignUpDto } from './dto/employee-sign-up.dto';
import { EmployeeSignInDto } from './dto/employee-sign-in.dto';
import { IsAuthGuard } from 'src/guards/auth.guard';
import { Employees } from 'src/employees/employee.decorator';
import { EmployeeVerifyDto } from './dto/employee-verify.dto';

@Controller('employees-auth')
export class EmployeesAuthController {
  constructor(private readonly employeesAuthService: EmployeesAuthService) {}

  @Post('sign-up')
  signUp(@Body() employeeSignUpDto: EmployeeSignUpDto) {
    return this.employeesAuthService.signUp(employeeSignUpDto);
  }

  @Post('verify')
  verifyEmail(@Body() employeeVerifyDto:EmployeeVerifyDto,) {
    return this.employeesAuthService.verifyEmail(employeeVerifyDto);
  }

  @Post('resend-verification')
  resendVerification(@Body('email') email) {
    return this.employeesAuthService.resendVerification(email);
  }
  @Post('sign-in')
  singIn(@Body() employeeSignInDto: EmployeeSignInDto) {
    return this.employeesAuthService.signIn(employeeSignInDto);
  }

  @Get('current-employee')
  @UseGuards(IsAuthGuard)
  getCurrentEmployee(@Employees() employId) {
    return this.employeesAuthService.getCurrentEmployee(employId);
  }
}
