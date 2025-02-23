import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';
import { CompanyModule } from 'src/company/company.module';
import { EmployeesModule } from 'src/employees/employees.module';
import { MongooseModule } from '@nestjs/mongoose';
import { fileSchema } from './schema/file.schema';
import { employeeSchema } from 'src/employees/schema/employee.schema';
import { companySchema } from 'src/company/schema/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name:"file",schema:fileSchema},
      {name:"employee",schema:employeeSchema},
      {name:"company",schema:companySchema},
    ]),
    AwsS3Module,CompanyModule,EmployeesModule
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports:[FilesService]
})
export class FilesModule {}
