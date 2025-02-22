import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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

@Injectable()
@UseGuards(IsAuthGuard)
export class CompanyService {
  constructor(
    @InjectModel('company') private companyModel: Model<Company>,
    private s3Service: AwsS3Service,
    @InjectModel('employee') private employeeModel: Model<Employee>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const existCompany = await this.companyModel.findOne({
      email: createCompanyDto.email,
    });
    if (existCompany) throw new BadRequestException('Company already exists');
    const company = await this.companyModel.create(createCompanyDto);
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

    if (!['basic', 'premium'].includes(company.subscriptionPlan)) {
      throw new BadRequestException(
        'Only basic or premium plans can add employees',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otpCode = Math.random().toString().slice(2, 8);
    const otpCodeValidateDate = new Date();
    otpCodeValidateDate.setTime(otpCodeValidateDate.getTime() + 3 * 60 * 1000);

    await this.companyModel.findByIdAndUpdate(
      companyId,
      {
        $inc: { employesCount: 1 },
      },
      { new: true },
    );

    const employee = await this.employeeModel.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      otpCode,
      otpCodeValidateDate,
    });

    return employee;
  }

  uploadFile(filePath, file) {
    return this.s3Service.uploadFile(filePath, file);
  }

  async uploadFiles(files) {
    const fileIds = [];

    for (let file of files) {
      const path = Math.random().toString().slice(2);

      const filePath = `files/${path}`;

      const fileId = await this.s3Service.uploadFile(filePath, file);

      fileIds.push(fileId);
    }
  }

  getFile(fileId) {
    return this.s3Service.getFileById(fileId);
  }

  deleteFileById(fileId) {
    return this.s3Service.deleteFileId(fileId);
  }
}
