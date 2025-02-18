import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';


import { EmailSenderService } from './email-sender/email-sender.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailSenderService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/send-email')
  sendEmail(@Body() body) {
    const { to, subject, text } = body;

    return this.emailService.sendEmailtext(to,subject,text)
  }
}
