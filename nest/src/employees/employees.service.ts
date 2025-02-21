import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
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
    return this.employeeModel
      .find()
      .populate({ path: 'company', select: '-posts -createdAt -__v' });
  }

  findOne(id: string) {
    return `This action returns a #${id} employee`;
  }

  update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    return `This action updates a #${id} employee`;
  }

  async remove(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException('invalid id is provided');
    const deletedEmplyee = await this.employeeModel.findByIdAndDelete(id);
    if (!deletedEmplyee)
      throw new BadRequestException('Employee could not be deleted');
    return deletedEmplyee;
  }

  async crudLimit(
    companyId: string,
    subscription: string,
    uploadedFile: number,
  ) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new BadRequestException('Company not found');
  

    if (subscription === 'free_tier' && company.crudCount >= 10) {
      throw new BadRequestException('Upgrade subscription plan');
    }
  

    if (subscription === 'basic') {
      if (company.employesCount > 10) {
        const extraEmployees = company.employesCount - 10;
        const extraCharge = extraEmployees * 5;
        throw new HttpException(
          {
            message: `Warning: Extra charge of $${extraCharge} per month`,
            extraCharge,
            status: 'warning',
          },
          HttpStatus.OK,
        );
      }
      return { isAllowed: true };
    }
  
    if (subscription === 'premium') {
      const basePrice = 300;
      const fileLimit = 11;
      const extraFileCost = 0.5;
  
      let extraCharge = 0;
      if (uploadedFile > fileLimit) {
        extraCharge = (uploadedFile - fileLimit) * extraFileCost;
      }
  
      const totalCost = basePrice + extraCharge;
  
      return {
        isAllowed: true,
        basePrice,
        extraCharge,
        totalCost,
        message: `Premium Plan: price - $${basePrice}, Extra Files: ${uploadedFile - fileLimit}, Extra Charge: $${extraCharge}, Total: $${totalCost}`,
      };
    }
  
    throw new BadRequestException('Invalid subscription plan');
  }
  

  async addEmpleyee(companyId: string) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new BadRequestException('company not found');

    if (company.subscriptionPlan !== 'basic') {
      throw new BadRequestException('only basic plan cann add employees');
    }

    

    await this.companyModel.findByIdAndUpdate(companyId, {
      $inc: { employesCount: 1 },
    });

    return 'employee added succsesffuly';
  }
}
