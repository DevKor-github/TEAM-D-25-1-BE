import { Test, TestingModule } from '@nestjs/testing';
import { UpdateMbtiAndTagsUseCase } from './updateMbtiAndTags';
import { UserRepository } from '../repositories/user';
import { UpdateMbtiAndTagsDto } from '../dtos/updateProfile.dto';
import { SocialProvider, Mbti, Tag } from '@prisma/client';
import { UserParam } from '../params/user';

describe('UpdateMbtiAndTagsUseCase', () => {
  let useCase: UpdateMbtiAndTagsUseCase;
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
    mbti: Mbti.ENFP,
    tag: [Tag.DRINKER, Tag.SPICY_FOOD_LOVER],
  };

  const mockUserRepository = {
    updatePartial: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMbtiAndTagsUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<UpdateMbtiAndTagsUseCase>(UpdateMbtiAndTagsUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('updates mbti and tags via repository.updatePartial', async () => {
      const userId = 'user-id';
      const dto: UpdateMbtiAndTagsDto = {
        mbti: 'ENFP',
        tags: ['DRINKER', 'SPICY_FOOD_LOVER'],
      };

      mockUserRepository.updatePartial.mockResolvedValue(mockUser);

      const result = await useCase.execute(userId, dto);

      expect(userRepository.updatePartial).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          mbti: Mbti.ENFP,
          tag: [Tag.DRINKER, Tag.SPICY_FOOD_LOVER],
        }),
      );
      expect(result).toEqual(mockUser);
    });
  });
});


