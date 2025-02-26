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
// import { CrudLimitGuard } from 'src/guards/limit.guard';
import { isVerified } from 'src/guards/isVerified.guard';
import { EmployeeSignUpDto } from 'src/employees-auth/dto/employee-sign-up.dto';
import { Employee } from 'src/employees/employee.decorator';
import { fileGuard } from 'src/guards/file.guard';
import { Company } from './company.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from 'src/files/schema/file.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Subscription } from 'src/enums/subscription.enum';

@Controller('company')
@UseGuards(IsAuthGuard)
@UseInterceptors(FileInterceptor('file'))
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    @InjectModel("file") private fileModel:Model<File>
  ) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto,@Employee() employeeId) {
    return this.companyService.create(createCompanyDto,employeeId);
  }

  @Get()
  findAll() {
    return this.companyService.findAll();
  }
  @Get('billing-info')
 async currentMothBilling(@Company() companyId, @Employee () employeeId){
    const file = await this.fileModel.find()
    console.log(file)
   return this.companyService.currentMonthBilling(companyId,employeeId,file)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch('change-password/:id')
  async changePassword (@Body () changePasswordDto:ChangePasswordDto,@Company () companyId){
    return this.companyService.changePassword(changePasswordDto,companyId)
  }

  @Patch('upgrade-subscrription/:id')
  async upgradePlan(@Company () companyId){
    return this.companyService.upgradePlan(companyId)
  }
  @Patch('downgrade-subscrription/:id')
  async downgradePlan(@Param('id') companyId: string, @Body('newPlan') newPlan: Subscription) {
    console.log(newPlan)
    return this.companyService.downgradePlan(companyId, newPlan);
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

 
}
