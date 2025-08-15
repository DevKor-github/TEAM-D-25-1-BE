import { Test, TestingModule } from '@nestjs/testing';
import { UnfollowUserUseCase } from './unfollowUser';
import { FollowerRepository } from '../repositories/follower';
import { UserRepository } from '../repositories/user';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FollowerStatus } from '@prisma/client';

describe('UnfollowUserUseCase', () => {
  let useCase: UnfollowUserUseCase;
  let followerRepository: jest.Mocked<FollowerRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockFollowerRepository = {
      getFollower: jest.fn(),
      deleteFollower: jest.fn(),
    };

    const mockUserRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnfollowUserUseCase,
        {
          provide: FollowerRepository,
          useValue: mockFollowerRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UnfollowUserUseCase>(UnfollowUserUseCase);
    followerRepository = module.get(FollowerRepository);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const followerId = 'follower-id';
    const userId = 'user-id';

    it('should successfully unfollow a user', async () => {
      const mockUser = {
        id: userId,
        firebaseUid: 'firebase-uid',
        email: 'test@example.com',
        username: 'testuser',
        isPrivate: false,
        createdAt: new Date(),
      };
      const mockFollower = {
        userId,
        followerId,
        status: FollowerStatus.ACCEPTED,
        createdAt: new Date(),
      };

      userRepository.findById.mockResolvedValue(mockUser);
      followerRepository.getFollower.mockResolvedValue(mockFollower);
      followerRepository.deleteFollower.mockResolvedValue(mockFollower);

      await expect(
        useCase.execute(followerId, userId),
      ).resolves.toBeUndefined();

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(followerRepository.getFollower).toHaveBeenCalledWith({
        userId,
        followerId,
      });
      expect(followerRepository.deleteFollower).toHaveBeenCalledWith(
        userId,
        followerId,
      );
    });

    it('should throw ForbiddenException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(followerId, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(followerRepository.getFollower).not.toHaveBeenCalled();
      expect(followerRepository.deleteFollower).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when not following the user', async () => {
      const mockUser = {
        id: userId,
        firebaseUid: 'firebase-uid',
        email: 'test@example.com',
        username: 'testuser',
        isPrivate: false,
        createdAt: new Date(),
      };

      userRepository.findById.mockResolvedValue(mockUser);
      followerRepository.getFollower.mockResolvedValue(null);

      await expect(useCase.execute(followerId, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(followerRepository.getFollower).toHaveBeenCalledWith({
        userId,
        followerId,
      });
      expect(followerRepository.deleteFollower).not.toHaveBeenCalled();
    });
  });
});
