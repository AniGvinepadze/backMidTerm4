import { Module } from '@nestjs/common';
import { EmployeesAuthService } from './employees-auth.service';
import { EmployeesAuthController } from './employees-auth.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { employeeSchema } from 'src/employees/schema/employee.schema';
import { EmailSenderModule } from 'src/email-sender/email-sender.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: 'employee', schema: employeeSchema }]),
    EmailSenderModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [EmployeesAuthController],
  providers: [EmployeesAuthService],
})
export class EmployeesAuthModule {}
