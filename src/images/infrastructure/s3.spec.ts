import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3';
import { S3Client } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3');
jest.mock('../../config', () => ({
  __esModule: true,
  default: () => ({
    aws: {
      accessKey: 'test-access-key',
      secretKey: 'test-secret-key',
    },
    s3: {
      region: 'ap-northeast-2',
      bucket: 'test-bucket',
      cloudfrontUrl: 'test.cloudfront.net/',
    },
  }),
}));

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 4,
      } as Express.Multer.File;

      // Mock the S3Client constructor
      const mockSend = jest.fn().mockResolvedValue({});
      const mockInstance = {
        send: mockSend,
      };
      (S3Client as jest.MockedClass<typeof S3Client>).mockImplementation(
        () => mockInstance as any,
      );

      const result = await service.uploadImage(mockFile, 'images/seed');

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('key');
      expect(result.key).toContain('images/seed/');
    });
  });

  describe('getFileExtension', () => {
    it('should return correct file extension', () => {
      const mockFile = {
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const result = service['getFileExtension'](mockFile.originalname);
      expect(result).toBe('jpg');
    });

    it('should return jpg as default when no extension', () => {
      const mockFile = {
        originalname: 'test',
      } as Express.Multer.File;

      const result = service['getFileExtension'](mockFile.originalname);
      expect(result).toBe('jpg');
    });
  });
});
