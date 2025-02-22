import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { companySchema } from './schema/company.schema';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';
import { employeeSchema } from 'src/employees/schema/employee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'company', schema: companySchema },
      { name: 'employee', schema: employeeSchema },
    ]),
    AwsS3Module,
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
