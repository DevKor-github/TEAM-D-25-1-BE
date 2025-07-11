import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ImagesService } from './service';
import { UploadImageResponseDto } from './dto/upload-image.dto';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('seed')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '시드 이미지 파일',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '시드 이미지 업로드 성공',
    type: UploadImageResponseDto,
  })
  async uploadSeedImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadImageResponseDto> {
    return await this.imagesService.uploadSeedImage(file);
  }

  @Post('profile')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '프로필 이미지 파일',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '프로필 이미지 업로드 성공',
    type: UploadImageResponseDto,
  })
  async uploadProfileImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadImageResponseDto> {
    return await this.imagesService.uploadUserProfileImage(file);
  }

  @Post('restaurant')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '레스토랑 이미지 파일',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '레스토랑 이미지 업로드 성공',
    type: UploadImageResponseDto,
  })
  async uploadRestaurantImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadImageResponseDto> {
    return await this.imagesService.uploadRestaurantImage(file);
  }

  @Post('review')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '리뷰 이미지 파일',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '리뷰 이미지 업로드 성공',
    type: UploadImageResponseDto,
  })
  async uploadReviewImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadImageResponseDto> {
    return await this.imagesService.uploadReviewImage(file);
  }
}
