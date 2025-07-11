import { Injectable } from '@nestjs/common';
import { S3Service } from './infrastructure/s3';

@Injectable()
export class ImagesService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadSeedImage(file: Express.Multer.File) {
    const result = await this.s3Service.uploadImage(file, 'images/seed');
    return { url: result.url };
  }

  async uploadUserProfileImage(file: Express.Multer.File) {
    const result = await this.s3Service.uploadImage(file, 'images/profile');
    return { url: result.url };
  }

  async uploadRestaurantImage(file: Express.Multer.File) {
    const result = await this.s3Service.uploadImage(file, 'images/restaurant');
    return { url: result.url };
  }

  async uploadReviewImage(file: Express.Multer.File) {
    const result = await this.s3Service.uploadImage(file, 'images/review');
    return { url: result.url };
  }

  async deleteImage(key: string) {
    return await this.s3Service.deleteImage(key);
  }
}
