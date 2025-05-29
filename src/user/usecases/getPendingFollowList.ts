import { Injectable } from '@nestjs/common';
import { FollowerRepository } from '@/user/repositories/follower';
import { UserRepository } from '@/user/repositories/user';
import { UserParam } from '../params/user';
import { FollowerListResponse, FollowerUserResponse } from '../dto';
import { FollowerStatus } from '@prisma/client';

@Injectable()
export class GetPendingFollowListUseCase {
  constructor(
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
    perPage: number = 20,
    page: number = 1,
  ): Promise<FollowerListResponse> {
    const pendingFollowers = await this.followerRepository.getFollowingList({
      userId,
      status: FollowerStatus.PENDING,
      page,
      perPage,
    });

    const followerIds = pendingFollowers.map((follower) => follower.followerId);
    const users = await this.userRepository.findByIds(followerIds);
    const userMaps = users.reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<string, UserParam>,
    );

    const followerUsers = pendingFollowers.map((follower) => {
      const user = userMaps[follower.followerId];
      return FollowerUserResponse.from(user);
    });

    return {
      items: followerUsers,
    };
  }
}
