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
import { ChangePasswordDto } from './dto/change-password.dto';
import { combineAll } from 'rxjs';
import { EmailSenderService } from 'src/email-sender/email-sender.service';

@Injectable()
@UseGuards(IsAuthGuard)
export class CompanyService {
  constructor(
    @InjectModel('company') private companyModel: Model<Company>,
    private s3Service: AwsS3Service,
    @InjectModel('employee') private employeeModel: Model<Employee>,
    private emailSender: EmailSenderService,
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

  async addEmpleyee(companyId: string, { email }: EmployeeSignUpDto) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new BadRequestException('company not found');

    console.log('Company Subscription Plan:', company.subscriptionPlan);

    if (company.subscriptionPlan === Subscription.BASIC) {
      if (company.employee.length >= 10)
        throw new BadRequestException('upgrade subscription');
    }

    // if (
    //   company.subscriptionPlan !== Subscription.BASIC ||
    //   Subscription.PREMIUM
    // ) {
    //   throw new BadRequestException(
    //     'Only basic or premium plans can add employees',
    //   );
    // }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const otpCode = Math.random().toString().slice(2, 8);
    const otpCodeValidateDate = new Date();
    otpCodeValidateDate.setTime(otpCodeValidateDate.getTime() + 3 * 60 * 1000);

    const employee = await this.employeeModel.create({
      email,
      // firstName,
      // lastName,
      // password: hashedPassword,
      company: companyId,
      otpCode,
      otpCodeValidateDate,
    });

    await this.emailSender.sendEmailtext(email, 'Verification Code', otpCode);
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

    return 'employee deleted succcsessfully';
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

  async changePassword(
    { currentPassword, newPassword }: ChangePasswordDto,
    companyId: string,
  ) {
    console.log(currentPassword, 'currentPassword');

    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    const isPassEqual = await bcrypt.compare(currentPassword, company.password);
    if (!isPassEqual)
      throw new BadRequestException('Current password is incorrect');

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.companyModel.findByIdAndUpdate(companyId, {
      password: hashedNewPassword,
    });

    return { message: 'Password updated successfully' };
  }

  async upgradePlan(companyId: string) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('company not found');

    let newPlan = company.subscriptionPlan;

    // if(newPlan !== "basic" || "free_tier" || "premium"){
    //   throw new BadRequestException("your provided subscription doesnt exist")
    // }
    if (company.subscriptionPlan === Subscription.FREE_TIER) {
      newPlan = Subscription.BASIC;
    }
    if (company.subscriptionPlan === Subscription.BASIC) {
      newPlan = Subscription.PREMIUM;
    }

    await this.companyModel.findByIdAndUpdate(companyId, {
      subscriptionPlan: newPlan,
    });

    return `successfully upgraded to ${newPlan}`;
  }

  async downgradePlan(companyId: string, newPlan: Subscription) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    console.log(newPlan, 'newPlan');

    if (
      !['basic', 'free_tier', 'premium'].includes(newPlan.toLowerCase().trim())
    ) {
      throw new BadRequestException("Your provided subscription doesn't exist");
    }


    if (
      company.subscriptionPlan === Subscription.FREE_TIER 
    ) {
      throw new BadRequestException(
        'you arent able to downgrade subscription you are already free_tier'
      );
    }
    if (
      company.subscriptionPlan === Subscription.BASIC &&
      newPlan.trim().toLowerCase() === 'free_tier' &&
      company.employee.length >= 1
    ) {
      throw new BadRequestException(
        'you arent able to downgrade subscription u have more than one employee',
      );
    }
    if (
      company.subscriptionPlan === Subscription.PREMIUM &&
      newPlan.trim().toLowerCase() === 'basic' &&
      company.employee.length >= 10 ||
      company.file.length >= 100
    ) {
      throw new BadRequestException(
        'you arent able to downgrade subscription u have more than 10 employee and more than 100 files',
      );
    }
    await this.companyModel.findByIdAndUpdate(companyId, {
      subscriptionPlan: newPlan,
    });

    return ` succsessfully downgraded to ${newPlan}`;
  }
}
