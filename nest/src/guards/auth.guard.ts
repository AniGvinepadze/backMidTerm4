import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  
  @Injectable()
  export class IsAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const request = context.switchToHttp().getRequest();
        const token = this.getTokenFromHeader(request.headers);
     
        if (!token) throw new BadRequestException('token is provided');
  
        const payLoad = await this.jwtService.verify(token);
        request.companyId = payLoad.companyId;
        request.subscription = payLoad.subscription
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
  