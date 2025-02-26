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

  async uploadFile(file, employeeId, view, filePath, companyId) {
    console.log("shempvida")
    await this.s3Service.uploadFile(filePath, file);

    const uploadedFile = await this.fileModel.create({
      filePath,
      employee: employeeId,
      company: companyId,
      view: [],
    });


    console.log(view,"view")
    await this.employeeModel.findByIdAndUpdate(
      employeeId,
      { $push: { file: uploadedFile._id } },
      { new: true },
    );
    await this.companyModel.findByIdAndUpdate(
      companyId,
      { $push: { file: uploadedFile._id } },
      { new: true },
    );
    
    // return { message: 'File uploaded successfully', filePath };
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
