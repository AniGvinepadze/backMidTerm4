import { forwardRef, Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { companySchema } from 'src/company/schema/company.schema';
import { employeeSchema } from './schema/employee.schema';

import { CompanyModule } from 'src/company/company.module';
import { fileSchema } from 'src/files/schema/file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employee', schema: employeeSchema },
      { name: 'company', schema: companySchema },
      { name: 'file', schema: fileSchema },
    ]),
    forwardRef(() => CompanyModule)
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesModule, EmployeesService,MongooseModule],
})
export class EmployeesModule {}
