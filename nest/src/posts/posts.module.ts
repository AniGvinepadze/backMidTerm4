import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { postSchema } from './schema/post.schema';
import { companySchema } from 'src/company/schema/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'post', schema: postSchema },
      { name: 'company', schema: companySchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
