import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async create(
    subscription: string,
    companyId: string,
    createPostDto: CreatePostDto,
  ) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new BadRequestException('company not found');

    // const postsCount = company.posts.length;

    const newPost = await this.postModel.create({
      ...createPostDto,
      company: companyId,
    });
    await this.companyModel.findByIdAndUpdate(company._id, {
      $push: { posts: newPost._id },
      $inc: { crudCount: 1 },
    });
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

  // async crudLimit(companyId: string, subscription: string) {
  //   const company = await this.companyModel.findById(companyId);
  //   if (!company) throw new BadRequestException('company not found');

  //   if (subscription === 'free_tier' && company.crudCount >= 10)
  //     throw new BadRequestException('upgrade subscription plan');

  //   if (subscription === 'basic') {
  //     if (company.crudCount >= 100) {
  //       throw new BadRequestException('upgrade subscription plan');
  //     }
  //     if (company.employesCount > 10) {
  //       const extraEmployees = company.employesCount - 10 + 1;
  //       const extraCharge = extraEmployees * 5;
  //       console.log(`extra charge:$${extraCharge} per month`);
  //       throw new HttpException(
  //         {
  //           message: `Warning: Extra charge of $${extraCharge} per month .`,
  //           extraCharge: extraCharge,
  //           status: 'warning',
  //         },
  //         HttpStatus.OK,
  //       );
  //     }
  //   }

  //   return true;
  // }


}
