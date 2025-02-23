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

    if (!token) throw new BadRequestException('Token is required');
    const payLoad = await this.jwtService.verify(token);
    console.log(payLoad,"payload")

    // Attach JWT info to the request object
    request.companyId = payLoad.companyId;
    request.employeeId = payLoad.employeeId;
    request.subscription = payLoad.subscription;

    console.log(request.companyId, 'companyId');
    console.log(request.employeeId, 'employeeId');
    console.log(request.subscription, 'subscription');

    // Access the file directly from the request
    const file = request.file; // This is the file that was uploaded using the FileInterceptor
    console.log(file, 'file');

    // If file is missing, throw an error
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    // Allowed mime types for file validation
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only CSV and Excel files are allowed.',
      );
    }

    // Check if the CRUD limit is reached for the company
    const crudIsAllowed = await this.companyService.crudLimit(
      request.companyId,
      request.subscription,
      file,
    );

    if (!crudIsAllowed) {
      throw new BadRequestException(
        'Subscription limit reached, upgrade subscription',
      );
    }

    return true;
  }

  // Utility function to extract token from headers
  getTokenFromHeader(headers) {
    const authorization = headers['authorization'];
    if (!authorization) return null;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
