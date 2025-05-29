import { Test, TestingModule } from '@nestjs/testing';
import { AcceptFollowUseCase } from './acceptFollow';
import { FollowerRepository } from '../repositories/follower';
import { FollowerStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('AcceptFollowUseCase', () => {
  let useCase: AcceptFollowUseCase;
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

  beforeEach(async () => {
    const mockFollowerRepository = {
      getFollower: jest.fn(),
      updateFollowerStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcceptFollowUseCase,
        {
          provide: FollowerRepository,
          useValue: mockFollowerRepository,
        },
      ],
    }).compile();

    useCase = module.get<AcceptFollowUseCase>(AcceptFollowUseCase);
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
      await expect(useCase.execute('user1', 'follower1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when follower status is not pending', async () => {
      // Arrange
      followerRepository.getFollower.mockResolvedValue({
        ...mockPendingFollower,
        status: FollowerStatus.ACCEPTED,
      });

      // Act & Assert
      await expect(useCase.execute('user1', 'follower1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should successfully accept a pending follower', async () => {
      // Arrange
      followerRepository.getFollower.mockResolvedValue(mockPendingFollower);
      followerRepository.updateFollowerStatus.mockResolvedValue(
        mockAcceptedFollower,
      );

      // Act
      const result = await useCase.execute('user1', 'follower1');

      // Assert
      expect(result.status).toBe(FollowerStatus.ACCEPTED);
      expect(followerRepository.updateFollowerStatus).toHaveBeenCalledWith(
        'user1',
        'follower1',
        { status: FollowerStatus.ACCEPTED },
      );
    });
  });
});
