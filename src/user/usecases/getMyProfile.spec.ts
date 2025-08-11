import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { GetMyProfileUseCase } from './getMyProfile';
import { UserRepository } from '../repositories/user';
import { UserParam } from '../params/user';
import { SocialProvider } from '@prisma/client';

describe('GetMyProfileUseCase', () => {
  let useCase: GetMyProfileUseCase;
  let userRepository: UserRepository;
  let configService: ConfigService;

  const mockUser: UserParam = {
    id: 'test-user-id',
    firebaseUid: 'firebase-uid-1234',
    email: 'test@example.com',
    username: 'testuser',
    nickname: 'Test User',
    socialProvider: SocialProvider.GOOGLE,
    isPrivate: false,
    createdAt: new Date(),
    profileImageUrl: '/images/profile/test.jpg',
    fcmToken: null,
    fcmTokenUpdatedAt: null,
    password: 'password',
    socialId: 'social-id',
  };

  const mockUserRepository = {
    findById: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyProfileUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<GetMyProfileUseCase>(GetMyProfileUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return user profile with full image URL', async () => {
      // Given
      const userId = 'test-user-id';
      const cloudfrontUrl = 'test.cloudfront.net';
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockConfigService.get.mockReturnValue(cloudfrontUrl);

      // When
      const result = await useCase.execute(userId);

      // Then
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(configService.get).toHaveBeenCalledWith('s3.cloudfrontUrl');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        nickname: mockUser.nickname,
        socialProvider: mockUser.socialProvider,
        isPrivate: mockUser.isPrivate,
        createdAt: mockUser.createdAt,
        profileImageUrl: `https://${cloudfrontUrl}${mockUser.profileImageUrl}`,
      });
    });

    it('should return null for profileImageUrl if it does not exist', async () => {
      // Given
      const userId = 'test-user-id';
      const userWithoutImage = { ...mockUser, profileImageUrl: null };
      mockUserRepository.findById.mockResolvedValue(userWithoutImage);

      // When
      const result = await useCase.execute(userId);

      // Then
      expect(result.profileImageUrl).toBeNull();
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Given
      const userId = 'non-existent-user-id';
      mockUserRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
