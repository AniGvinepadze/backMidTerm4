import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Post } from './schema/post.schema';
import { Company } from 'src/company/schema/company.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel('post') private postModel: Model<Post>,
    @InjectModel('company') private companyModel: Model<Company>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const newPost = await this.postModel.create(createPostDto);
    return newPost;
  }

  findAll() {
    return this.postModel
      .find()
      .populate({ path: 'company', select: '-posts -createdAt -__v' });
  }

  findOne(id: string) {
    return `This action returns a #${id} post`;
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async remove(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException('invalid id is provided');
    const deletedPost = await this.postModel.findByIdAndDelete(id);
    if (!deletedPost)
      throw new BadRequestException('post could not be deleted');
    return deletedPost;
  }
}
