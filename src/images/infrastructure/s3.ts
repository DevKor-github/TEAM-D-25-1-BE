import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v7 as uuidv7 } from 'uuid';
import getConfig from '../../config';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly config = getConfig();

  constructor() {
    this.s3Client = new S3Client({
      region: this.config.s3.region,
      credentials: {
        accessKeyId: this.config.s3.accessKey,
        secretAccessKey: this.config.s3.secretKey,
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string }> {
    const fileExtension = this.getFileExtension(file.originalname);
    const fileName = `${uuidv7()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.config.s3.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = `https://s3.${this.config.s3.region}.amazonaws.com/${this.config.s3.bucket}/${key}`;
    return { url, key };
  }

  async deleteImage(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.s3.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'jpg';
  }
}
