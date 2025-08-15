import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileUseCase } from './updateProfile';
import { UserRepository } from '../repositories/user';
import { UpdateProfileDto } from '../dtos/updateProfile.dto';
import { SocialProvider } from '@prisma/client';
import { UserParam } from '../params/user';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let userRepository: UserRepository;

  const mockUser: UserParam = {
    id: 'user-id',
    firebaseUid: 'firebase-uid',
    email: 'user@example.com',
    username: 'username',
    nickname: 'nick',
    password: 'hashed',
    socialProvider: SocialProvider.GOOGLE,
    socialId: 'social-id',
    isPrivate: false,
    createdAt: new Date(),
    profileImageUrl: '/images/profile/abc.jpg',
    fcmToken: undefined,
    fcmTokenUpdatedAt: undefined,
    lastWatered: undefined,
  };

  const mockUserRepository = {
    updatePartial: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('updates basic profile fields via repository.updatePartial', async () => {
      const userId = 'user-id';
      const dto: UpdateProfileDto = {
        email: 'new@example.com',
        nickname: 'new-nick',
        description: 'hello',
        isPrivate: true,
        status: 'ACTIVE',
        password: 'new-pass',
      };

      mockUserRepository.updatePartial.mockResolvedValue(mockUser);

      const result = await useCase.execute(userId, dto);

      expect(userRepository.updatePartial).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          email: dto.email,
          nickname: dto.nickname,
          description: dto.description,
          isPrivate: dto.isPrivate,
          status: dto.status,
          password: dto.password,
        }),
      );
      expect(result).toEqual(mockUser);
    });
  });
});

