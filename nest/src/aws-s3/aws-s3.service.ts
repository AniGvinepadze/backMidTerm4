import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Readable } from 'stream';

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

  async getFileById(filePath) {
    if (!filePath) return;

    const config = {
      Bucket: this.bucketName,
      Key: filePath,
    };

    const command = new GetObjectCommand(config);
    const fileStream = await this.storageServie.send(command);
    const chunks = [];

    if (fileStream.Body instanceof Readable) {
      for await (let stream of fileStream.Body) {
        chunks.push(stream);
      }

      const fileBuffer = Buffer.concat(chunks);
      const b64 = fileBuffer.toString('base64');
      const file = `data:${fileStream.ContentType};base64,${b64}`;
      return file;
    }
  }

  async deleteFileId(fileId) {
    if (!fileId) return;

    const config = {
      Bucket: this.bucketName,
      Key: fileId,
    };
    const command = new DeleteObjectCommand(config);
    await this.storageServie.send(command);
    
    return fileId;
  }
}
