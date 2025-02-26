import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Company } from './schema/company.schema';
import { IsAuthGuard } from 'src/guards/auth.guard';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { EmployeeSignUpDto } from 'src/employees-auth/dto/employee-sign-up.dto';
import { Employee } from 'src/employees/schema/employee.schema';
import * as bcrypt from 'bcrypt';
import { classToClassFromExist } from 'class-transformer';
import { Subscription } from 'src/enums/subscription.enum';

@Injectable()
@UseGuards(IsAuthGuard)
export class CompanyService {
  constructor(
    @InjectModel('company') private companyModel: Model<Company>,
    private s3Service: AwsS3Service,
    @InjectModel('employee') private employeeModel: Model<Employee>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, employeeId: string) {
    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) throw new BadRequestException('employee not found');
    const existCompany = await this.companyModel.findOne({
      email: createCompanyDto.email,
    });
    if (existCompany) throw new BadRequestException('Company already exists');
    const company = await this.companyModel.create({
      ...createCompanyDto,
      employee: employeeId,
    });
    return company;
  }

  findAll() {
    return this.companyModel.find().populate({ path: 'posts' });
  }

  async findOne(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException('invalid id provided');

    const company = await this.companyModel.findById(id);
    if (!company) throw new NotFoundException('company not found');
    return company;
  }

  async update(
    role: string,
    tokenId: string,
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ) {
    console.log(role, 'rolee3');
    if (tokenId !== id && role !== 'admin')
      throw new UnauthorizedException('permition denied');
    if (!isValidObjectId(id))
      throw new BadRequestException('ivalid id provided');
    const updatedCompany = await this.companyModel.findByIdAndUpdate(
      id,
      updateCompanyDto,
      { new: true },
    );
    if (!updatedCompany)
      throw new BadRequestException('company could not be updated');
    return updatedCompany;
  }

  async remove(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException('ivalid id provided');

    const deletedCompany = await this.companyModel.findByIdAndDelete(id);
    if (!deletedCompany)
      throw new BadRequestException('company could not be deleted');
    return deletedCompany;
  }

  async crudLimit(
    companyId: string,
    subscription: string,
    uploadedFile: number,
  ) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new BadRequestException('Company not found');

    if (subscription === 'free_tier' && company.crudCount >= 10) {
      throw new BadRequestException('Upgrade subscription plan');
    }

    if (subscription === 'basic') {
      if (company.employesCount > 10) {
        const extraEmployees = company.employesCount - 10;
        const extraCharge = extraEmployees * 5;
        throw new HttpException(
          {
            message: `Warning: Extra charge of $${extraCharge} per month`,
            extraCharge,
            status: 'warning',
          },
          HttpStatus.OK,
        );
      }
      return { isAllowed: true };
    }

    if (subscription === 'premium') {
      const basePrice = 300;
      const fileLimit = 11;
      const extraFileCost = 0.5;

      let extraCharge = 0;
      if (uploadedFile > fileLimit) {
        extraCharge = (uploadedFile - fileLimit) * extraFileCost;
      }

      const totalCost = basePrice + extraCharge;

      return {
        isAllowed: true,
        basePrice,
        extraCharge,
        totalCost,
        message: `Premium Plan: price - $${basePrice}, Extra Files: ${uploadedFile - fileLimit}, Extra Charge: $${extraCharge}, Total: $${totalCost}`,
      };
    }

    throw new BadRequestException('Invalid subscription plan');
  }

  async addEmpleyee(
    companyId: string,
    { firstName, email, lastName, password }: EmployeeSignUpDto,
  ) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new BadRequestException('company not found');

    console.log('Company Subscription Plan:', company.subscriptionPlan);

    if (company.subscriptionPlan === Subscription.BASIC) {
      if (company.employee.length >= 10)
        throw new BadRequestException('upgrade subscription');
    }

    if (
      company.subscriptionPlan !== Subscription.BASIC ||
      Subscription.PREMIUM
    ) {
      throw new BadRequestException(
        'Only basic or premium plans can add employees',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otpCode = Math.random().toString().slice(2, 8);
    const otpCodeValidateDate = new Date();
    otpCodeValidateDate.setTime(otpCodeValidateDate.getTime() + 3 * 60 * 1000);

    const employee = await this.employeeModel.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      company: companyId,
      otpCode,
      otpCodeValidateDate,
    });

    await this.companyModel.findByIdAndUpdate(
      companyId,
      {
        $push: { employee: employee._id },
        // $inc: { employesCount: 1 },
      },
      { new: true },
    );
    return employee;
  }

  async deleteEmployee(id: string, employeeId: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException('Invalid ID provided');

    const deletedEmployee = await this.employeeModel.findByIdAndDelete(id);
    // console.log(deletedEmployee, 'deletedEmplieyyyee');

    return deletedEmployee;
  }

  async currentMonthBilling(companyId: string, employeeId: string, file) {
    const company = await this.companyModel.findById(companyId);

    if (company.subscriptionPlan === Subscription.BASIC) {
      const extraEmployees = company.employee.length - 10 + 1;
      const cost = 0;
      const extraCharge = extraEmployees * 5;
      const totalCost = cost + extraCharge;

      return {
        cost,
        extraCharge,
        totalCost,
        message: `basic plan : cost : $${cost}, extra charge :$${extraCharge}, totalCost : $${totalCost} `,
      };
    }

    if (company.subscriptionPlan === Subscription.PREMIUM) {
      const basePrice = 300;
      const fileLimit = 1000;
      const extraFileCost = 0.5;

      let extraCharge = 0;

      if (file.length > fileLimit) {
        extraCharge = (file.length - fileLimit) * extraFileCost;
      }

      const totalCost = basePrice + extraCharge;

      return {
        basePrice,
        extraCharge,
        totalCost,
        message: `premium plan: price $${basePrice}, extra charge: $${extraCharge},total: $${totalCost}`,
      };
    }
  }
}
