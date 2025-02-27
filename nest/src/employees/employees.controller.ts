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
import { Employees } from './employee.decorator';
import { isVerified } from 'src/guards/isVerified.guard';


@Controller('employees')
@UseGuards(IsAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @UseGuards(IsAuthGuard)
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }



  @Patch('update-employee/:id')
  @UseGuards(isVerified)
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Employees() employeeId,
  ) {
    return this.employeesService.update(employeeId, id, updateEmployeeDto);
  }

  @Delete(':id')
  // @UseGuards(CrudLimitGuard)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
