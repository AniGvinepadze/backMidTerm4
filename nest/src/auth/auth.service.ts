import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';
import { SignUpDto } from './dto/sign-up.dto';

import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('company') private companyModel: Model<Company>,
    private jwtService: JwtService,
  ) {}

  async signUp({ companyName, country, email, industry, password }: SignUpDto) {
    const existCompany = await this.companyModel.findOne({ email });
    if (existCompany) throw new BadRequestException('user already exist');

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.companyModel.create({
      email,
      companyName,
      country,
      industry,
      password: hashedPassword,
    });

    return 'user registered succsessfully';
  }

  async singIn({ email, password }: SignInDto) {
    const existCompany = await this.companyModel.findOne({ email });
    if (!existCompany)
      throw new BadRequestException('email or password is incorrect');

    const isPassequal = await bcrypt.compare(password, existCompany.password);
    if (!isPassequal)
      throw new BadRequestException('email or password is incorrect');

    const payLoad = {
      companyId: existCompany._id,
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
