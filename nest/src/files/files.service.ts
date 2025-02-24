import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from './schema/file.schema';
import { Employee } from 'src/employees/schema/employee.schema';
import { Company } from 'src/company/schema/company.schema';

@Injectable()
export class FilesService {
  constructor(
    private s3Service: AwsS3Service,
    @InjectModel('file') private fileModel: Model<File>,
    @InjectModel('employee') private employeeModel: Model<Employee>,
    @InjectModel('company') private companyModel: Model<Company>,
  ) {}

  async uploadFile(file, employeeId, body) {
    const employee = await this.employeeModel.findById(employeeId);
    console.log(employeeId,"employheeId")
    if (!employee) {
      throw new BadRequestException('employee not found.');
    }

    const company = await this.companyModel.findById(employee.company);
    if (!company) {
      throw new BadRequestException('company not found.');
    }
    console.log(company, 'companuy');
    console.log(employee, 'employee');

    // if (company.subscriptionPlan === 'free_tier' && company.crudCount >= 10) {
    //   throw new BadRequestException('Upgrade subscription plan');
    // }

    // if (company.subscriptionPlan === 'basic' && company.employesCount > 10) {
    //   const extraCharge = (company.employesCount - 10) * 5;
    //   throw new HttpException(
    //     {
    //       message: `warning: Extra charge of $${extraCharge} per month`,
    //       extraCharge,
    //       status: 'warning',
    //     },
    //     HttpStatus.OK,
    //   );
    // }

    const path = Math.random().toString().slice(2);
    const type = file.mimetype.split('/')[1];
    const filePath = `files/${path}.${type}`;
   
    const uploadFile = await this.s3Service.uploadFile(filePath, file);
    console.log('S3 Upload Success:', uploadFile);

    return { message: 'File uploaded successfully', filePath };
    // return this.s3Service.uploadFile(filePath, file);
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
