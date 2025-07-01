import { Test, TestingModule } from '@nestjs/testing';
import { GetPendingFollowListUseCase } from '@/user/usecases/getPendingFollowList';
import { FollowerRepository } from '@/user/repositories/follower';
import { UserRepository } from '@/user/repositories/user';
import { FollowerStatus } from '@prisma/client';
import { FollowerUserResponse } from '@/user/dto';

describe('GetPendingFollowListUseCase', () => {
  let useCase: GetPendingFollowListUseCase;
  let followerRepository: jest.Mocked<FollowerRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  const mockPendingFollowerList = [
    {
      userId: 'user1',
      followerId: 'pendingUser1',
      status: FollowerStatus.PENDING,
      createdAt: new Date(),
    },
    {
      userId: 'user1',
      followerId: 'pendingUser2',
      status: FollowerStatus.PENDING,
      createdAt: new Date(),
    },
  ];

  const mockUsers = [
    {
      id: 'pendingUser1',
      email: 'pending1@example.com',
      username: 'pendingUser1',
      nickname: 'Pending User 1',
      isPrivate: false,
      createdAt: new Date(),
      profileImageUrl: 'profile1.jpg',
    },
    {
      id: 'pendingUser2',
      email: 'pending2@example.com',
      username: 'pendingUser2',
      nickname: 'Pending User 2',
      isPrivate: false,
      createdAt: new Date(),
      profileImageUrl: 'profile2.jpg',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPendingFollowListUseCase,
        {
          provide: FollowerRepository,
          useValue: {
            getFollowingList: jest.fn(),
            getFollowersList: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findByIdList: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetPendingFollowListUseCase>(
      GetPendingFollowListUseCase,
    );
    followerRepository = module.get(FollowerRepository);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return pending follow list successfully', async () => {
      // Arrange
      const userId = 'user1';
      const status = FollowerStatus.PENDING;
      const perPage = 20;
      const page = 1;

      followerRepository.getFollowingList.mockResolvedValue(
        mockPendingFollowerList,
      );
      userRepository.findByIdList.mockResolvedValue(mockUsers);

      // Act
      const result = await useCase.execute(userId, perPage, page);

      // Assert
      expect(followerRepository.getFollowingList).toHaveBeenCalledWith({
        userId,
        page,
        perPage,
        status,
      });
      expect(userRepository.findByIdList).toHaveBeenCalledWith([
        'pendingUser1',
        'pendingUser2',
      ]);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toBeInstanceOf(FollowerUserResponse);
      expect(result.items[1]).toBeInstanceOf(FollowerUserResponse);
    });

    it('should handle empty pending follow list', async () => {
      // Arrange
      const userId = 'user1';
      followerRepository.getFollowingList.mockResolvedValue([]);
      userRepository.findByIdList.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.items).toHaveLength(0);
    });

    it('should apply pagination correctly', async () => {
      // Arrange
      const userId = 'user1';
      const status = FollowerStatus.PENDING;
      const perPage = 1;
      const page = 1;

      followerRepository.getFollowingList.mockResolvedValue([
        mockPendingFollowerList[0],
      ]);
      userRepository.findByIdList.mockResolvedValue([mockUsers[0]]);

      // Act
      const result = await useCase.execute(userId, perPage, page);

      // Assert
      expect(followerRepository.getFollowingList).toHaveBeenCalledWith({
        userId,
        page,
        perPage,
        status,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('pendingUser1');
    });
  });
});
