import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Employee } from './schema/employee.schema';
import { Company } from 'src/company/schema/company.schema';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel('employee') private employeeModel: Model<Employee>,
    @InjectModel('company') private companyModel: Model<Company>,
  ) {}
  async create(
    subscription: string,
    companyId: string,
    createEmployeeDto: CreateEmployeeDto,
  ) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new BadRequestException('company not found');

    const newEmployee = await this.employeeModel.create({
      ...createEmployeeDto,
      company: companyId,
    });

    await this.companyModel.findByIdAndUpdate(company._id, {
      $push: { employees: newEmployee._id },
      $inc: { crudCount: 1 },
    });

    return newEmployee;
  }

  findAll() {
    throw new BadRequestException(
      'sorry, only company is able to see employees full list',
    );
  }

  findOne(id: string) {
    throw new BadRequestException(
      'sorry, only company is able to see employees full list',
    );
  }
  async update(
    employeId: string,
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    if (!isValidObjectId(id))
      throw new BadRequestException('Invalid ID provided');

    const { email } = updateEmployeeDto;

    const existEmployee = await this.employeeModel.findOne({ email });
    console.log(existEmployee, 'existEmployee');

    if (existEmployee && existEmployee.isVerified) {
      throw new BadRequestException('company already verified');
    }

    const updatedEmployee = await this.employeeModel.findByIdAndUpdate(
      id,
      updateEmployeeDto,
      { new: true },
    );

    if (!updatedEmployee) throw new NotFoundException('employee not found ');

    return updatedEmployee;
  }

  async remove(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException('invalid id is provided');
    const deletedEmplyee = await this.employeeModel.findByIdAndDelete(id);
    if (!deletedEmplyee)
      throw new BadRequestException('Employee could not be deleted');
    return deletedEmplyee;
  }
}
