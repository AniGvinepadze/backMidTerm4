import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Role } from './role.decorator';
import { IsAuthGuard } from 'src/guards/auth.guard';
import { IsRoleGuard } from 'src/guards/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CrudLimitGuard } from 'src/guards/limit.guard';
import { isVerified } from 'src/guards/isVerified.guard';
import { EmployeeSignUpDto } from 'src/employees-auth/dto/employee-sign-up.dto';
import { Employee } from 'src/employees/employee.decorator';

@Controller('company')
@UseGuards(IsAuthGuard, CrudLimitGuard)
@UseInterceptors(FileInterceptor('file'))
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(IsAuthGuard, IsRoleGuard)
  update(
    @Role() role,
    @Req() req,
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyService.update(
      role,
      req.companyId,
      id,
      updateCompanyDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }

  @Post('add-employee')
  @UseGuards(isVerified)
  addEmployee(@Req() req, @Body() employeeSignUpDto: EmployeeSignUpDto) {
    const companyId = req.companyId;
    return this.companyService.addEmpleyee(companyId, employeeSignUpDto);
  }

  @Delete('delete-employee/:id')
  @UseGuards(isVerified)
  deleteEmployee(@Param('id') id: string, @Employee() employeeId) {
    return this.companyService.deleteEmployee(id, employeeId);
  }

  // @Post('upload-file')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   console.log(file, 'fileeeeeeee');
  //   const path = Math.random().toString().slice(2);
  //   const type = file.mimetype.split('/')[1];
  //   const filePath = `files/${path}.${type}`;
  //   console.log(filePath, 'path');
  //   console.log(file, 'file');

  //   const allowedMimeTypes = [
  //     'text/csv',
  //     'application/vnd.ms-excel',
  //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //   ];

  //   if (!allowedMimeTypes.includes(file.mimetype)) {
  //     throw new BadRequestException(
  //       'Invalid file type. Only PNG and JPEG are allowed.',
  //     );
  //   }
  //   console.log(filePath, 'filepath');

  //   return this.companyService.uploadFile(filePath, file);
  // }

  // @Post('upload-files')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFiles(@UploadedFiles() files: Express.Multer.File) {
  //   const path = Math.random().toString().slice(2);

  //   const filePath = `files/${path}`;

  //   return this.companyService.uploadFiles(files);
  // }

  // @Post('get-file')
  // getFileById(@Body('fileId') fileId) {
  //   return this.companyService.getFile(fileId);
  // }

  // @Post('delete-file')
  // deleteFileById(@Body('fileId') fileId) {
  //   return this.companyService.deleteFileById(fileId);
  // }
}
