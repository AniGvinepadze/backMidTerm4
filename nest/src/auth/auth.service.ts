import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { EmailSenderService } from 'src/email-sender/email-sender.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('company') private companyModel: Model<Company>,
    private jwtService: JwtService,
    private emailSender: EmailSenderService,
  ) {}

  async signUp({ companyName, country, email, industry, password }: SignUpDto) {
    const existCompany = await this.companyModel.findOne({ email });
    if (existCompany) throw new BadRequestException('user already exist');

    const hashedPassword = await bcrypt.hash(password, 10);

    const otpCode = Math.random().toString().slice(2, 8);
    const otpCodeValidateDate = new Date();
    otpCodeValidateDate.setTime(otpCodeValidateDate.getTime() + 3 * 60 * 1000);

    await this.companyModel.create({
      email,
      companyName,
      country,
      industry,
      password: hashedPassword,
      otpCode,
      otpCodeValidateDate,
    });

    await this.emailSender.sendEmailtext(email, 'Verification Code', otpCode);

    return 'Verify Email';
  }

  async verifyEmail(email, otpCode) {
    const existCompany = await this.companyModel.findOne({ email });
    console.log(existCompany, 'existcompanu');
    if (!existCompany) throw new BadRequestException('comapny not found');

    if (existCompany.isVerified)
      throw new BadRequestException('company already verified');

    if (existCompany.otpCodeValidateDate < new Date())
      throw new BadRequestException('Otp Code is Out Date');

    if (otpCode !== existCompany.otpCode)
      throw new BadRequestException(' wrong otp code');

    await this.companyModel.findByIdAndUpdate(existCompany._id, {
      $set: { isVerified: true, otpCode: null, otpCodeValidateDate: null },
    });

    const payLoad = {
      companyId: existCompany._id,
      role: existCompany.role,
      subscription: existCompany.subscriptionPlan,
    };

    const accessToken = await this.jwtService.sign(payLoad, {
      expiresIn: '1h',
    });

    return {
      message: 'user verified succsessfully',
      accessToken,
    };
  }

  async resendVerification(email) {
    const existCompany = await this.companyModel.findOne({ email });
    console.log(existCompany, 'exist');
    if (!existCompany) throw new BadRequestException('comapny not found');

    if (existCompany.isVerified)
      throw new BadRequestException('company already verified');

    const otpCode = Math.random().toString().slice(2, 8);
    const otpCodeValidateDate = new Date();
    otpCodeValidateDate.setTime(otpCodeValidateDate.getTime() + 3 * 60 * 1000);

    await this.companyModel.findByIdAndUpdate(existCompany._id, {
      $set: { otpCode, otpCodeValidateDate },
    });

    await this.emailSender.sendEmailtext(email, 'verification code', otpCode);

    return 'check email';
  }

  async singIn({ email, password }: SignInDto) {
    const existCompany = await this.companyModel.findOne({ email });
    if (!existCompany)
      throw new BadRequestException('email or password is incorrect');

    const isPassequal = await bcrypt.compare(password, existCompany.password);
    if (!isPassequal)
      throw new BadRequestException('email or password is incorrect');

    if (!existCompany.isVerified) throw new BadRequestException('verify user');

    const payLoad = {
      companyId: existCompany._id,
      role: existCompany.role,
      subscription: existCompany.subscriptionPlan,
    };

    const accessToken = await this.jwtService.sign(payLoad, {
      expiresIn: '1h',
    });

    return { accessToken };
  }

  async getCurrentCompany(companyId) {
    const company = await this.companyModel
      .findById(companyId)
      .select('-password');
    return company;
  }
}
