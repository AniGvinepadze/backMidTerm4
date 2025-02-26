import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsAuthGuard } from 'src/guards/auth.guard';
// import { CrudLimitGuard } from 'src/guards/limit.guard';
import { fileGuard } from 'src/guards/file.guard';
import { Employee } from 'src/employees/employee.decorator';
import { Company } from 'src/company/company.decorator';

@Controller('files')
@UseGuards(IsAuthGuard, fileGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Employee() employeeId,
    @Body() body,
    @Company() companyId
  ) {
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only CSV and Excel are allowed.',
      );
    }
    const path = Math.random().toString().slice(2);
    const filePath = `files/${path}`;

    // console.log(filePath, 'filepath');

    return this.filesService.uploadFile(file, employeeId, body, filePath, companyId);
  }

  @Post('upload-files')
  @UseInterceptors(FileInterceptor('file'))
  uploadFiles(@UploadedFiles() files: Express.Multer.File) {
    const path = Math.random().toString().slice(2);

    const filePath = `files/${path}`;

    return this.filesService.uploadFiles(files);
  }

  @Post('get-file')
  getFileById(@Body('fileId') fileId) {
    return this.filesService.getFile(fileId);
  }

  @Post('delete-file')
  deleteFileById(@Body('fileId') fileId) {
    return this.filesService.deleteFileById(fileId);
  }
}
