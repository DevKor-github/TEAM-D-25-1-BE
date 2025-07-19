import { Module } from '@nestjs/common';
import { ImagesController } from './controller';
import { ImagesService } from './service';
import { S3Service } from './infrastructure/s3';
import { UserRepository } from '@/user/repositories/user';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, S3Service, UserRepository],
  exports: [ImagesService, S3Service],
})
export class ImagesModule {}
