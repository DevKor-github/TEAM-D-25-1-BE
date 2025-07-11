import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import getConfig from '../config';

@Injectable()
export class UploadService {
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

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: this.config.s3.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = `https://s3.${this.config.s3.region}.amazonaws.com/${this.config.s3.bucket}/${fileName}`;
    return { url };
  }
}
