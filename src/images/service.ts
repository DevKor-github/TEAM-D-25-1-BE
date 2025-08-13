import { Injectable } from '@nestjs/common';
import { S3Service } from './infrastructure/s3';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ImagesService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService,
  ) {}

  async uploadSeedImage(file: Express.Multer.File) {
    const result = await this.s3Service.uploadImage(file, 'images/seed');
    // await this.prisma.images.create({ data: { key: result.key } });
    return { url: result.url };
  }

  async uploadUserProfileImage(file: Express.Multer.File) {
    const result = await this.s3Service.uploadImage(file, 'images/profile');
    // await this.prisma.images.create({ data: { key: result.key } });
    return { url: result.url };
  }

  async uploadRestaurantImage(file: Express.Multer.File) {
    const result = await this.s3Service.uploadImage(file, 'images/restaurant');
    // await this.prisma.images.create({ data: { key: result.key } });
    return { url: result.url };
  }

  async uploadReviewImage(file: Express.Multer.File) {
    const result = await this.s3Service.uploadImage(file, 'images/review');
    // await this.prisma.images.create({ data: { key: result.key } });
    return { url: result.url };
  }

  async deleteImage(key: string) {
    await this.s3Service.deleteImage(key);

    await this.prisma.$transaction([
      // this.prisma.images.delete({ where: { key } }),

      this.prisma.user.updateMany({
        where: { profileImageUrl: key },
        data: { profileImageUrl: null },
      }),

      this.prisma.$executeRaw`
        SELECT "Restaurant"
        SET images = array_remove(images, ${key})
        WHERE ${key} = ANY(images)
      `,

      this.prisma.$executeRaw`
        SELECT "SavedRestaurant"
        SET images = array_remove(images, ${key})
        WHERE ${key} = ANY(images)
      `,
    ]);
  }
}
