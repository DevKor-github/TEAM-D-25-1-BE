import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FollowerRepository } from '../repositories/follower';
import { UserRepository } from '../repositories/user';

@Injectable()
export class UnfollowUserUseCase {
  constructor(
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository,
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

    if (!existingFollower) {
      throw new NotFoundException('Not following this user');
    }

    await this.followerRepository.deleteFollower(userId, followerId);
  }
}
