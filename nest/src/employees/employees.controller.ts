import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { IsAuthGuard } from 'src/guards/auth.guard';
import { CrudLimitGuard } from 'src/guards/limit.guard';
import { Subscription } from 'src/company/subscription.decorator';

@Controller('employees')
@UseGuards(IsAuthGuard,CrudLimitGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  create(
    @Subscription() subscription,
    @Req() req,
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    const companyId = req.companyId;
    return this.employeesService.create(
      subscription,
      companyId,
      createEmployeeDto,
    );
  }

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Post('add-employee')
  addEmployee(@Req() req) {
    const companyId = req.companyId;
    return this.employeesService.addEmpleyee(companyId);
  }
}
