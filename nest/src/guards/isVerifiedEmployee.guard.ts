import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from 'src/employees/schema/employee.schema';

@Injectable()
export class isVerifiedEmployee implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel('employee') private employeeModel: Model<Employee>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.getTokenFromHeader(request.headers);

      if (!token) throw new BadRequestException('token is provided');

      const payLoad = await this.jwtService.verify(token);
      console.log(payLoad, 'payLoad in employy auth');
      console.log(token, 'token in employe auth');

      request.employeeId = payLoad.employeeId;
      console.log(payLoad.employeeId, 'employId in employ auth');
      request.comapnyId = payLoad.companyId;
      console.log(payLoad.companyId, 'companyId in employ auth');
      request.file = payLoad.file;
      request.isVerified = payLoad.isVeri;
      console.log(payLoad.isVerified, 'isVerifird in employ auth');
      // console.log(request.comapnyId, 'companuId ');

      console.log(request.employeeId, 'employeID');
      // request.otpCode = payLoad.otpCode;
      // console.log(request.otpCode,"otpCode")

      const employee = await this.employeeModel.findById(payLoad.employeeId);
      //   console.log(employee, 'emplohyee');

      if (!employee) throw new UnauthorizedException('employee not found');
      //   console.log(employee.isVerified, 'isVerofoed');
      if (!employee.isVerified)
        throw new UnauthorizedException('employee is not verified');

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
}
