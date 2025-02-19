import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { companySchema } from './schema/company.schema';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'company', schema: companySchema }]),
    AwsS3Module
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
