import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { IsAuthGuard } from 'src/guards/auth.guard';
import { Subscription } from 'src/company/subscription.decorator';
// import { CrudLimitGuard } from 'src/guards/limit.guard';

@Controller('posts')
@UseGuards(IsAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @Subscription() subscription,
    @Req() req,
    @Body() createPostDto: CreatePostDto,
  ) {
    const companyId = req.companyId;
    return this.postsService.create(subscription, companyId, createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }


}
