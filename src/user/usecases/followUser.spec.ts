import { Test, TestingModule } from '@nestjs/testing';
import { FollowUserUseCase } from './followUser';
import { FollowerRepository } from '../repositories/follower';
import { UserRepository } from '../repositories/user';
import { FollowerStatus } from '@prisma/client';
import { ConflictException, ForbiddenException } from '@nestjs/common';

describe('FollowUserUseCase', () => {
  let useCase: FollowUserUseCase;
  let followerRepository: jest.Mocked<FollowerRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: 'user1',
    email: 'user1@example.com',
    username: 'user1',
    nickname: 'User 1',
    isPrivate: false,
    createdAt: new Date(),
    profileImageUrl: 'profile1.jpg',
  };

  const mockPrivateUser = {
    ...mockUser,
    id: 'privateUser',
    username: 'privateUser',
    isPrivate: true,
  };

  const mockBannedFollower = {
    userId: 'user1',
    followerId: 'bannedUser',
    status: FollowerStatus.BANNED,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowUserUseCase,
        {
          provide: FollowerRepository,
          useValue: {
            createFollower: jest.fn(),
            getFollower: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FollowUserUseCase>(FollowUserUseCase);
    followerRepository = module.get(FollowerRepository);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create ACCEPTED follower when target user is not private', async () => {
      // Arrange
      const followerId = 'follower1';
      const userId = 'user1';
      userRepository.findById.mockResolvedValue(mockUser);
      followerRepository.getFollower.mockResolvedValue(null);

      // Act
      await useCase.execute(followerId, userId);

      // Assert
      expect(followerRepository.createFollower).toHaveBeenCalledWith({
        userId,
        followerId,
        status: FollowerStatus.ACCEPTED,
      });
    });

    it('should create PENDING follower when target user is private', async () => {
      // Arrange
      const followerId = 'follower1';
      const userId = 'privateUser';
      userRepository.findById.mockResolvedValue(mockPrivateUser);
      followerRepository.getFollower.mockResolvedValue(null);

      // Act
      await useCase.execute(followerId, userId);

      // Assert
      expect(followerRepository.createFollower).toHaveBeenCalledWith({
        userId,
        followerId,
        status: FollowerStatus.PENDING,
      });
    });

    it('should throw ConflictException when follower already exists', async () => {
      // Arrange
      const followerId = 'follower1';
      const userId = 'user1';
      userRepository.findById.mockResolvedValue(mockUser);
      followerRepository.getFollower.mockResolvedValue({
        userId,
        followerId,
        status: FollowerStatus.ACCEPTED,
        createdAt: new Date(),
      });

      // Act & Assert
      await expect(useCase.execute(followerId, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ForbiddenException when follower is banned', async () => {
      // Arrange
      const followerId = 'bannedUser';
      const userId = 'user1';
      userRepository.findById.mockResolvedValue(mockUser);
      followerRepository.getFollower.mockResolvedValue(mockBannedFollower);

      // Act & Assert
      await expect(useCase.execute(followerId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
