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

  async uploadFile(file, employeeId, body, filePath, companyId) {
    // const uploadFile = await this.s3Service.uploadFile(filePath, file);
    // console.log('S3 Upload Success:', uploadFile);
    console.log(companyId, 'compnayID');
    const uploadedFile = await this.fileModel.create({
      filePath,
      employee: employeeId,
      company: companyId,
      view: [],
    });
    const gela = await this.employeeModel.findByIdAndUpdate(
      companyId,
      {
        $push: { file: uploadedFile._id },
      },
      { new: true },
    );
    console.log(gela, 'gela');
    const company = await this.companyModel.findById(companyId);
    // company.file.push(uploadedFile._id)
    await company.save();
    console.log(company, 'company');
    return { message: 'File uploaded successfully', filePath };
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
