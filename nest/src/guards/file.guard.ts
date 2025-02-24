import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CompanyService } from 'src/company/company.service';
import { EmployeesService } from 'src/employees/employees.service';

@Injectable()
export class fileGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly companyService: CompanyService,
    private readonly employeeService: EmployeesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeader(request.headers);
    // console.log(request, 'req');
    // console.log(token, 'tpkenm');

    if (!token) throw new BadRequestException('Token is required');
    const payLoad = await this.jwtService.verify(token);
 
    request.companyId = payLoad.companyId;
    request.employeeId = payLoad.employeeId;
    console.log(request.employeeId,"dsd")
    request.subscription = payLoad.subscription;
    // console.log(request, 'request');

    request.file = payLoad.file;

    if (!request.file) {
      throw new BadRequestException('No file provided.');
    }

    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(request.file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only CSV and Excel files are allowed.',
      );
    }

    const crudIsAllowed = await this.companyService.crudLimit(
      request.companyId,
      request.subscription,
      request.file,
    );

    if (!crudIsAllowed) {
      throw new BadRequestException(
        'Subscription limit reached, upgrade subscription',
      );
    }

    return true;
  }

  getTokenFromHeader(headers) {
    const authorization = headers['authorization'];
    if (!authorization) return null;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
