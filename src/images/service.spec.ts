import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './service';
import { S3Service } from './infrastructure/s3';

describe('ImagesService', () => {
  let service: ImagesService;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: S3Service,
          useValue: {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    s3Service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadSeedImage', () => {
    it('should upload seed image to correct folder', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 4,
      } as Express.Multer.File;

      const s3Result = {
        url: 'https://s3.ap-northeast-2.amazonaws.com/bucket/images/seed/test.jpg',
        key: 'images/seed/test.jpg',
      };
      const mockResult = {
        url: 'https://s3.ap-northeast-2.amazonaws.com/bucket/images/seed/test.jpg',
      };

      jest.spyOn(s3Service, 'uploadImage').mockResolvedValue(s3Result);

      const result = await service.uploadSeedImage(mockFile);

      expect(result).toEqual(mockResult);
      expect(s3Service.uploadImage).toHaveBeenCalledWith(
        mockFile,
        'images/seed',
      );
    });
  });

  describe('uploadUserProfileImage', () => {
    it('should upload profile image to correct folder', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'profile.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 4,
      } as Express.Multer.File;

      const s3Result = {
        url: 'https://s3.ap-northeast-2.amazonaws.com/bucket/images/profile/test.jpg',
        key: 'images/profile/test.jpg',
      };
      const mockResult = {
        url: 'https://s3.ap-northeast-2.amazonaws.com/bucket/images/profile/test.jpg',
      };

      jest.spyOn(s3Service, 'uploadImage').mockResolvedValue(s3Result);

      const result = await service.uploadUserProfileImage(mockFile);

      expect(result).toEqual(mockResult);
      expect(s3Service.uploadImage).toHaveBeenCalledWith(
        mockFile,
        'images/profile',
      );
    });
  });
});
