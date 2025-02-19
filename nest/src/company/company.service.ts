import {
  BadRequestException,
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

@Injectable()
@UseGuards(IsAuthGuard)
export class CompanyService {
  constructor(
    @InjectModel('company') private companyModel: Model<Company>,
    private s3Service: AwsS3Service,
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

  uploadFile(filePath, file) {
    return this.s3Service.uploadFile(filePath, file);
  }
}
