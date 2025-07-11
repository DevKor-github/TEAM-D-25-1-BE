import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './controller';
import { ImagesService } from './service';

describe('ImagesController', () => {
  let controller: ImagesController;
  let service: ImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [
        {
          provide: ImagesService,
          useValue: {
            uploadSeedImage: jest.fn(),
            uploadUserProfileImage: jest.fn(),
            uploadRestaurantImage: jest.fn(),
            uploadReviewImage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
    service = module.get<ImagesService>(ImagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadSeedImage', () => {
    it('should upload seed image successfully', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 4,
      } as Express.Multer.File;

      const mockResult = {
        url: 'https://s3.ap-northeast-2.amazonaws.com/bucket/images/seed/test.jpg',
      };

      jest.spyOn(service, 'uploadSeedImage').mockResolvedValue(mockResult);

      const result = await controller.uploadSeedImage(mockFile);

      expect(result).toEqual(mockResult);
      expect(service.uploadSeedImage).toHaveBeenCalledWith(mockFile);
    });
  });
});
