import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class CrudLimitGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const companyId = request.companyId;
    const subscription = request.subscription;

    console.log(companyId, 'companyId');
    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }

    const crudIsAllowed = await this.postsService.crudLimit(
      companyId,
      subscription,
    );

    if (!crudIsAllowed) {
      throw new BadRequestException(
        'Free-tier limit reached, upgrade subscription',
      );
    }

    return true;
  }
}
