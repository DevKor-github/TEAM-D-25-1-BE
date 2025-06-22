import { FollowerStatus } from '@prisma/client';
import { FollowerRepository } from '../repositories/follower';
import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HandleFollowUseCase {
  constructor(private readonly followerRepository: FollowerRepository) {}

  async execute(userId: string, followerId: string, status: FollowerStatus) {
    const follower = await this.followerRepository.getFollower({
      userId,
      followerId,
    });

    if (!follower || follower.status !== FollowerStatus.PENDING) {
      throw new NotFoundException('No pending follower found');
    }

    return this.followerRepository.updateFollowerStatus(userId, followerId, {
      status,
    });
  }
}
