import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { FollowerRepository } from '../repositories/follower';
import { UserRepository } from '../repositories/user';
import { FollowerStatus } from '@prisma/client';
import { CreateFollowNotificationUseCase } from '@/notification/usecases/createFollowNotification';

@Injectable()
export class FollowUserUseCase {
  constructor(
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationUseCase: CreateFollowNotificationUseCase,
  ) {}

  async execute(followerId: string, userId: string): Promise<void> {
    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw new ForbiddenException('User not found');
    }

    const existingFollower = await this.followerRepository.getFollower({
      userId,
      followerId,
    });
    if (existingFollower) {
      if (existingFollower.status === FollowerStatus.BANNED) {
        throw new ForbiddenException('Cannot follow banned user');
      }
      throw new ConflictException('Already following this user');
    }

    await this.followerRepository.createFollower({
      userId,
      followerId,
      status: targetUser.isPrivate
        ? FollowerStatus.PENDING
        : FollowerStatus.ACCEPTED,
    });

    await this.notificationUseCase.execute({
      followerId,
      userId,
    });
  }
}
