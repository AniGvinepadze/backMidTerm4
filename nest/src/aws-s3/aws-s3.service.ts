import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AwsS3Service {
  private storageServie;
  private bucketName;

  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME;
    this.storageServie = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(filePath: string, file) {
    if (!filePath) throw new BadRequestException('file Path is required');

    const config = {
      Key: filePath,
      Bucket: this.bucketName,
      File: file.buffer,
    };
    // console.log(this.bucketName, 'bucketBsme');
    // console.log(file, 'file');

    const uploadCommand = new PutObjectCommand(config);
    await this.storageServie.send(uploadCommand);

    return filePath;
  }
}
