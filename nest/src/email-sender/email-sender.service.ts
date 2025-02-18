import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailSenderService {

    constructor(private emailService:MailerService){}

    async sendEmailtext(to,subject,text){


        const options = {
            from:"WEB 10 <a.gvin3@gmail.com>",
            to,
            subject,
            text
        }

        const info  =await this.emailService.sendMail(options)
        console.log("email sent succsesffuly")
    }

}
