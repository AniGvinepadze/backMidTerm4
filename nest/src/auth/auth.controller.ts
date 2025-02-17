import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { IsAuthGuard } from 'src/guards/auth.guard';
import { Company } from 'src/company/company.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.singIn(signInDto);
  }

  @Get('current-company')
  @UseGuards(IsAuthGuard)
  getCurrentCompany(@Company() companyId) {
    return this.authService.getCurrentCompany(companyId);
  }
}
