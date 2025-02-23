import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CompanyService } from 'src/company/company.service';

@Injectable()
export class CrudLimitGuard implements CanActivate {
  constructor(

    private jwtService: JwtService,
    private readonly companyService: CompanyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeader(request.headers);
    console.log(token)

    if (!token) throw new BadRequestException('token is provided');
    const payLoad = await this.jwtService.verify(token);
    request.companyId = payLoad.companyId;
    request.subscription = payLoad.subscription;
    // request.uploadedFile = payLoad.file;
    // console.log(request.uploadedFile, 'uploaded file');

    if (!request.companyId) {
      throw new BadRequestException('companyId is required');
    }

    const crudIsAllowed = await this.companyService.crudLimit(
      request.companyId,
      request.subscription,
      request.uploadedFile,
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
