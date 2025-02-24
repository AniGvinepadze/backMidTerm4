import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';
import { Employee } from 'src/employees/schema/employee.schema';
import { Subscription } from 'src/enums/subscription.enum';

@Injectable()
export class fileGuard implements CanActivate {
  constructor(
    @InjectModel('employee') private employModel: Model<Employee>,
    @InjectModel('company') private companyModel: Model<Company>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const employId = request.employeeId;

    const employ = await this.employModel.findById(employId);
    const company = await this.companyModel.findById(employ.company);
    request.companyId = employ.company;

    if (
      company.file.length > 10 &&
      company.subscriptionPlan === Subscription.FREE_TIER
    ) {
      throw new BadRequestException('permition dineded');
    }

    if (
      company.file.length > 100 &&
      company.subscriptionPlan === Subscription.BASIC
    ) {
      throw new BadRequestException('permition dineded');
    }

    return true;
  }
}
