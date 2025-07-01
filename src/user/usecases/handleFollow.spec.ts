import { Test, TestingModule } from '@nestjs/testing';
import { HandleFollowUseCase } from './handleFollow';
import { FollowerRepository } from '../repositories/follower';
import { FollowerStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('HandleFollowUseCase', () => {
  let useCase: HandleFollowUseCase;
  let followerRepository: jest.Mocked<FollowerRepository>;

  const mockPendingFollower = {
    userId: 'user1',
    followerId: 'follower1',
    status: FollowerStatus.PENDING,
    createdAt: new Date(),
  };

  const mockAcceptedFollower = {
    ...mockPendingFollower,
    status: FollowerStatus.ACCEPTED,
  };

  const mockRejectedFollower = {
    ...mockPendingFollower,
    status: FollowerStatus.REJECTED,
  };

  const mockBannedFollower = {
    ...mockPendingFollower,
    status: FollowerStatus.BANNED,
  };

  beforeEach(async () => {
    const mockFollowerRepository = {
      getFollower: jest.fn(),
      updateFollowerStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleFollowUseCase,
        {
          provide: FollowerRepository,
          useValue: mockFollowerRepository,
        },
      ],
    }).compile();

    useCase = module.get<HandleFollowUseCase>(HandleFollowUseCase);
    followerRepository = module.get(FollowerRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when no pending follower exists', async () => {
      // Arrange
      followerRepository.getFollower.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute('user1', 'follower1', FollowerStatus.ACCEPTED),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when follower status is not pending', async () => {
      // Arrange
      followerRepository.getFollower.mockResolvedValue({
        ...mockPendingFollower,
        status: FollowerStatus.ACCEPTED,
      });

      // Act & Assert
      await expect(
        useCase.execute('user1', 'follower1', FollowerStatus.ACCEPTED),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully accept a pending follower', async () => {
      // Arrange
      followerRepository.getFollower.mockResolvedValue(mockPendingFollower);
      followerRepository.updateFollowerStatus.mockResolvedValue(
        mockAcceptedFollower,
      );

      // Act
      const result = await useCase.execute(
        'user1',
        'follower1',
        FollowerStatus.ACCEPTED,
      );

      // Assert
      expect(result.status).toBe(FollowerStatus.ACCEPTED);
      expect(followerRepository.updateFollowerStatus).toHaveBeenCalledWith(
        'user1',
        'follower1',
        { status: FollowerStatus.ACCEPTED },
      );
    });

    it('should successfully reject a pending follower', async () => {
      // Arrange
      followerRepository.getFollower.mockResolvedValue(mockPendingFollower);
      followerRepository.updateFollowerStatus.mockResolvedValue(
        mockRejectedFollower,
      );

      // Act
      const result = await useCase.execute(
        'user1',
        'follower1',
        FollowerStatus.REJECTED,
      );

      // Assert
      expect(result.status).toBe(FollowerStatus.REJECTED);
      expect(followerRepository.updateFollowerStatus).toHaveBeenCalledWith(
        'user1',
        'follower1',
        { status: FollowerStatus.REJECTED },
      );
    });

    it('should successfully ban a pending follower', async () => {
      // Arrange
      followerRepository.getFollower.mockResolvedValue(mockPendingFollower);
      followerRepository.updateFollowerStatus.mockResolvedValue(
        mockBannedFollower,
      );

      // Act
      const result = await useCase.execute(
        'user1',
        'follower1',
        FollowerStatus.BANNED,
      );

      // Assert
      expect(result.status).toBe(FollowerStatus.BANNED);
      expect(followerRepository.updateFollowerStatus).toHaveBeenCalledWith(
        'user1',
        'follower1',
        { status: FollowerStatus.BANNED },
      );
    });

    it('should throw NotFoundException when trying to update non-pending follower to any status', async () => {
      // Arrange
      const testCases = [
        FollowerStatus.ACCEPTED,
        FollowerStatus.REJECTED,
        FollowerStatus.BANNED,
      ];

      for (const status of testCases) {
        followerRepository.getFollower.mockResolvedValue({
          ...mockPendingFollower,
          status: FollowerStatus.REJECTED, // 이미 REJECTED 상태인 팔로워
        });

        // Act & Assert
        await expect(
          useCase.execute('user1', 'follower1', status),
        ).rejects.toThrow(NotFoundException);
      }
    });
  });
});
