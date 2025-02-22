import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { CompanyService } from 'src/company/company.service';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class CrudLimitGuard implements CanActivate {
  constructor(
    // private readonly postsService: PostsService
    // private readonly postsService: PostsService
    private readonly companyService: CompanyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
   console.log(request)
    const companyId = request.companyId;
    const subscription = request.subscription;
    const uploadedFile = request.file;

    console.log(request.companyId, 'companyId');
    console.log(request.subscription, 'subs');

    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }

    const crudIsAllowed = await this.companyService.crudLimit(
      companyId,
      subscription,
      uploadedFile,
    );

    if (!crudIsAllowed) {
      throw new BadRequestException(
        'Subscription limit reached, upgrade subscription',
      );
    }

    return true;
  }
}
