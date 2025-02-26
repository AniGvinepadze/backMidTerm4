import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailSenderModule } from 'src/email-sender/email-sender.module';
import { EmailSenderService } from 'src/email-sender/email-sender.service';
import { Employee } from 'src/employees/schema/employee.schema';
import { EmployeeSignUpDto } from './dto/employee-sign-up.dto';
import * as bcrypt from 'bcrypt';
import { EmployeeSignInDto } from './dto/employee-sign-in.dto';

@Injectable()
export class EmployeesAuthService {
  constructor(
    @InjectModel('employee') private employeeModel: Model<Employee>,
    private jwtService: JwtService,
    private emailSender: EmailSenderService,
  ) {}

  async signUp({ email, firstName, lastName, password }: EmployeeSignUpDto) {
    const existEmployee = await this.employeeModel.findOne({ email });
    if (existEmployee)
      throw new BadRequestException('employee with this email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.random().toString().slice(2, 8);
    const otpCodeValidateDate = new Date();
    otpCodeValidateDate.setTime(otpCodeValidateDate.getTime() + 3 * 60 * 1000);

    await this.employeeModel.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      otpCode,
      otpCodeValidateDate,
    });

    await this.emailSender.sendEmailtext(email, 'Verification Code', otpCode);

    return 'Verify email';
  }

  async verifyEmail(email, otpCode) {
    const existEmployee = await this.employeeModel.findOne({ email });

    if (!existEmployee) throw new BadRequestException('employee not found');

    if (existEmployee.isVerified)
      throw new BadRequestException('employee already verified');

    if (existEmployee.otpCodeValidateDate < new Date())
      throw new BadRequestException('Otp Code is Out Date');

    if (otpCode !== existEmployee.otpCode)
      throw new BadRequestException(' wrong otp code');

    await this.employeeModel.findByIdAndUpdate(existEmployee._id, {
      $set: { isVerified: true, otpCode: null, otpCodeValidateDate: null },
    });

    const payLoad = {
      employeeId: existEmployee._id,
    };

    const accessToken = await this.jwtService.sign(payLoad, {
      expiresIn: '1h',
    });

    return {
      message: 'employee verified successfully',
      accessToken,
    };
  }

  async resendVerification(email) {
    const existEmployee = await this.employeeModel.findOne({ email });

    if (!existEmployee) throw new BadRequestException('employee not found');

    // if (existEmployee.isVerified)
    //   throw new BadRequestException('company already verified');

    const otpCode = Math.random().toString().slice(2, 8);
    const otpCodeValidateDate = new Date();
    otpCodeValidateDate.setTime(otpCodeValidateDate.getTime() + 3 * 60 * 1000);

    await this.employeeModel.findByIdAndUpdate(existEmployee._id, {
      $set: { otpCode, otpCodeValidateDate },
    });

    await this.emailSender.sendEmailtext(email, 'verification code', otpCode);

    return 'check email';
  }

  async signIn({ email, otpCode }: EmployeeSignInDto) {
    const existEmployee = await this.employeeModel.findOne({ email });

    if (!existEmployee)
      throw new BadRequestException('email or password is incorrect');

    // if (existEmployee.isVerified)
    //   throw new BadRequestException('employee already verified');

    // if (existEmployee.otpCodeValidateDate < new Date())
    //   throw new BadRequestException('Otp Code is Out Date');

    // console.log(existEmployee.otpCode, 'otp code');
    // console.log(otpCode);

    // if (otpCode !== existEmployee.otpCode)
    //   throw new BadRequestException(' wrong otp code');

    await this.employeeModel.findByIdAndUpdate(existEmployee._id, {
      $set: { isVerified: true, otpCode: null, otpCodeValidateDate: null },
    });

    const payLoad = {
      employeeId: existEmployee._id,
    };

    const accessToken = await this.jwtService.sign(payLoad, {
      expiresIn: '1h',
    });

    return { accessToken };
  }

  async getCurrentEmployee(employeeId) {
    const employee = await this.employeeModel
      .findById(employeeId)
      .select('-password');

    return employee;
  }
}
