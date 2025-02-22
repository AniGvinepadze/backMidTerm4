import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { postSchema } from './schema/post.schema';
import { companySchema } from 'src/company/schema/company.schema';
import { EmployeesModule } from 'src/employees/employees.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'post', schema: postSchema },
      { name: 'company', schema: companySchema },
    ]),
    // EmployeesModule
    CompanyModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
