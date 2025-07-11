import { Module } from '@nestjs/common';
import { ImagesController } from './controller';
import { ImagesService } from './service';
import { S3Service } from './infrastructure/s3';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, S3Service],
  exports: [ImagesService, S3Service],
})
export class ImagesModule {}
