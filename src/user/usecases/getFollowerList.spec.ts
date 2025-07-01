import { Test, TestingModule } from '@nestjs/testing';
import { GetFollowerListUseCase } from './getFollowerList';
import { FollowerRepository } from '../repositories/follower';
import { UserRepository } from '../repositories/user';
import { FollowerStatus } from '@prisma/client';
import { UserParam } from '../params/user';
import { FollowerUserResponse } from '../dto';

describe('GetFollowerListUseCase', () => {
  let useCase: GetFollowerListUseCase;
  let followerRepository: jest.Mocked<FollowerRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  const mockFollowerList = [
    {
      userId: 'user1',
      followerId: 'follower1',
      status: FollowerStatus.ACCEPTED,
      createdAt: new Date(),
    },
    {
      userId: 'user2',
      followerId: 'follower2',
      status: FollowerStatus.ACCEPTED,
      createdAt: new Date(),
    },
  ];

  const mockUsers: UserParam[] = [
    {
      id: 'user1',
      email: 'user1@example.com',
      username: 'user1',
      nickname: 'User 1',
      isPrivate: false,
      createdAt: new Date(),
      profileImageUrl: 'profile1.jpg',
    },
    {
      id: 'user2',
      email: 'user2@example.com',
      username: 'user2',
      nickname: 'User 2',
      isPrivate: false,
      createdAt: new Date(),
      profileImageUrl: 'profile2.jpg',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFollowerListUseCase,
        {
          provide: FollowerRepository,
          useValue: {
            getFollowersList: jest.fn(),
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

    useCase = module.get<GetFollowerListUseCase>(GetFollowerListUseCase);
    followerRepository = module.get(FollowerRepository);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return follower list successfully', async () => {
      // Arrange
      const userId = 'testUser';
      const perPage = 20;
      const page = 1;

      followerRepository.getFollowersList.mockResolvedValue(mockFollowerList);
      userRepository.findByIdList.mockResolvedValue(mockUsers);

      // Act
      const result = await useCase.execute(userId, perPage, page);

      // Assert
      expect(followerRepository.getFollowersList).toHaveBeenCalledWith({
        userId,
        status: FollowerStatus.ACCEPTED,
        page,
        perPage,
      });

      expect(userRepository.findByIdList).toHaveBeenCalledWith([
        'user1',
        'user2',
      ]);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toBeInstanceOf(FollowerUserResponse);
      expect(result.items[1]).toBeInstanceOf(FollowerUserResponse);
    });

    it('should handle empty follower list', async () => {
      // Arrange
      const userId = 'testUser';
      followerRepository.getFollowersList.mockResolvedValue([]);
      userRepository.findByIdList.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.items).toHaveLength(0);
    });
  });
});
