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
export class IsAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel("employee") private employeeModel:Model<Employee>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.getTokenFromHeader(request.headers);

      if (!token) throw new BadRequestException('token is provided');

      const payLoad = await this.jwtService.verify(token);
      request.companyId = payLoad.companyId;
      request.employeeId = payLoad.employeeId;
      request.subscription = payLoad.subscription;
      const employee = await this.employeeModel.find()
      console.log(employee,"employee")
      console.log(request.companyId, 'companyId in auth');
      console.log(request.employeeId, 'employeeId in auth');
      // request.uploadedFile = payLoad.uploadedFile

      return true;
    } catch (error) {
      throw new UnauthorizedException('permition denied');
    }
  }
  getTokenFromHeader(headers) {
    const authorization = headers['authorization'];
    if (!authorization) return null;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
