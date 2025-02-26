import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { IsAuthGuard } from 'src/guards/auth.guard';
import { Employee } from './employee.decorator';
import { isVerified } from 'src/guards/isVerified.guard';

@Controller('employees')
@UseGuards(IsAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateEmployeeDto: UpdateEmployeeDto,
  // ) {
  //   return this.employeesService.update(id, updateEmployeeDto);
  // }

  @Patch('update-employee/:id')
  @UseGuards(isVerified)
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Employee() employeeId,
  ) {
    return this.employeesService.update(employeeId, id, updateEmployeeDto);
  }

  @Delete(':id')
  // @UseGuards(CrudLimitGuard)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
