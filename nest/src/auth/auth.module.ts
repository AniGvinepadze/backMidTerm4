import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { companySchema } from 'src/company/schema/company.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{name:"company",schema:companySchema}]),
    JwtModule.register({
      global:true,
      secret:process.env.JWT_SECRET
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
