import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileImageUseCase } from './updateProfileImage';
import { UserRepository } from '../repositories/user';
import { UpdateProfileImageDto } from '../dtos/updateProfileImage.dto';
import { UserParam } from '../params/user';
import { SocialProvider } from '@prisma/client';

describe('UpdateProfileImageUseCase', () => {
  let useCase: UpdateProfileImageUseCase;
  let userRepository: UserRepository;

  const mockUser: UserParam = {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    nickname: 'Test User',
    socialProvider: SocialProvider.GOOGLE,
    isPrivate: false,
    createdAt: new Date(),
    profileImageUrl: '/images/profile/new-image.jpg',
    fcmToken: null,
    fcmTokenUpdatedAt: null,
    password: 'password',
    socialId: 'social-id',
  };

  const mockUserRepository = {
    updateProfileImageUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileImageUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<UpdateProfileImageUseCase>(UpdateProfileImageUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update the user profile image url and return the updated user', async () => {
      // Given
      const userId = 'test-user-id';
      const dto: UpdateProfileImageDto = {
        profileImageUrl: 'https://test.cloudfront.net/images/profile/new-image.jpg',
      };
      const expectedUri = '/images/profile/new-image.jpg';
      mockUserRepository.updateProfileImageUrl.mockResolvedValue(mockUser);

      // When
      const result = await useCase.execute(userId, dto);

      // Then
      expect(userRepository.updateProfileImageUrl).toHaveBeenCalledWith(
        userId,
        expectedUri,
      );
      expect(result).toEqual(mockUser);
    });
  });
});
