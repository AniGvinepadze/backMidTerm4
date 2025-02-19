import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { PostsModule } from './posts/posts.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailSenderModule } from './email-sender/email-sender.module';
import { AwsS3Module } from './aws-s3/aws-s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port:465,
        auth:{
          user:process.env.EMAIL_USER,
          pass:process.env.EMAIL_PASS
        }
      },
    }),
    CompanyModule,
    PostsModule,
    AuthModule,
    EmployeesModule,
    EmailSenderModule,
    AwsS3Module,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
