import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { companySchema } from './schema/company.schema';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';
import { employeeSchema } from 'src/employees/schema/employee.schema';
import { fileSchema } from 'src/files/schema/file.schema';
import { EmployeesModule } from 'src/employees/employees.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'company', schema: companySchema },
      { name: 'employee', schema: employeeSchema },
      { name: 'file', schema: fileSchema },
    ]),
    AwsS3Module,
    EmployeesModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
