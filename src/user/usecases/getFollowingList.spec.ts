import { Test, TestingModule } from '@nestjs/testing';
import { GetFollowingListUseCase } from './getFollowingList';
import { FollowerRepository } from '../repositories/follower';
import { UserRepository } from '../repositories/user';
import { FollowerStatus } from '@prisma/client';
import { UserParam } from '../params/user';
import { FollowingUserResponse } from '../dto';

describe('GetFollowingListUseCase', () => {
  let useCase: GetFollowingListUseCase;
  let followerRepository: jest.Mocked<FollowerRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  const mockFollowingList = [
    {
      userId: 'user1',
      followerId: 'following1',
      status: FollowerStatus.ACCEPTED,
      createdAt: new Date(),
    },
    {
      userId: 'user1',
      followerId: 'following2',
      status: FollowerStatus.ACCEPTED,
      createdAt: new Date(),
    },
  ];

  const mockUsers: UserParam[] = [
    {
      id: 'following1',
      firebaseUid: 'firebase-uid-1234',
      email: 'following1@example.com',
      username: 'following1',
      nickname: 'Following 1',
      isPrivate: false,
      createdAt: new Date(),
      profileImageUrl: 'profile1.jpg',
    },
    {
      id: 'following2',
      firebaseUid: 'firebase-uid-1234',
      email: 'following2@example.com',
      username: 'following2',
      nickname: 'Following 2',
      isPrivate: false,
      createdAt: new Date(),
      profileImageUrl: 'profile2.jpg',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFollowingListUseCase,
        {
          provide: FollowerRepository,
          useValue: {
            getFollowingList: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetFollowingListUseCase>(GetFollowingListUseCase);
    followerRepository = module.get(FollowerRepository);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return following list successfully', async () => {
      // Arrange
      const userId = 'user1';
      const perPage = 20;
      const page = 1;

      followerRepository.getFollowingList.mockResolvedValue(mockFollowingList);
      userRepository.findByIdList.mockResolvedValue(mockUsers);

      // Act
      const result = await useCase.execute(userId, perPage, page);

      // Assert
      expect(followerRepository.getFollowingList).toHaveBeenCalledWith({
        userId,
        status: FollowerStatus.ACCEPTED,
        page,
        perPage,
      });

      expect(userRepository.findByIdList).toHaveBeenCalledWith([
        'following1',
        'following2',
      ]);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toBeInstanceOf(FollowingUserResponse);
      expect(result.items[1]).toBeInstanceOf(FollowingUserResponse);
    });

    it('should handle empty following list', async () => {
      // Arrange
      const userId = 'user1';
      followerRepository.getFollowingList.mockResolvedValue([]);
      userRepository.findByIdList.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.items).toHaveLength(0);
    });
  });
});
