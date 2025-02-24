import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ApiGatewayTimeoutResponse } from '@nestjs/swagger';
import { error } from 'console';
import { Model } from 'mongoose';
import { Company } from 'src/company/schema/company.schema';
import { Employee } from 'src/employees/schema/employee.schema';

@Injectable()
export class isVerified implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel('company') private companyModel: Model<Company>,
    @InjectModel('employee') private employeeModel: Model<Employee>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.getTokenFromHeader(request.headers);
      // const employeeToken = this.getTokenFromHeaderForEmployee(request.headers);
      // if (!token) throw new BadRequestException('token is provided');
      console.log(token, 'companyToken');
      // console.log(employeeToken, 'empooyeToken');

      const payLoad = await this.jwtService.verify(token);
      request.companyId = payLoad.companyId;
      // request.employeeId = payLoad.employeeId;
      request.subscription = payLoad.subscription;
      request.isVerified = payLoad.isVerified;
      request.otpCode = payLoad.otpCode;

      console.log(request.comapnyId, 'companyId');
      console.log(request.employeeId, 'employeeId');
      console.log(request.subscription, 'sub');
      console.log(request.isVerified, 'isVerified');

      const company = await this.companyModel.findById(payLoad.companyId);

      if (!company) throw new UnauthorizedException('company not found');
      if (!company.isVerified)
        throw new UnauthorizedException('company is not verified');

      return true;
    } catch (error) {
      throw new UnauthorizedException('permition denied for isVerifed');
    }
  }
  getTokenFromHeader(headers) {
    const authorization = headers['authorization'];
    if (!authorization) return null;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
  getTokenFromHeaderForEmployee(headers) {
    const authorization = headers['authorization'];
    if (!authorization) return null;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
