import { forwardRef, Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { companySchema } from 'src/company/schema/company.schema';
import { employeeSchema } from './schema/employee.schema';
import { PostsModule } from 'src/posts/posts.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employee', schema: employeeSchema },
      { name: 'company', schema: companySchema },
    ]),
    forwardRef(() => PostsModule),
    CompanyModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesModule],
})
export class EmployeesModule {}
