import { Injectable } from '@nestjs/common';
import { FollowerRepository } from '@/user/repositories/follower';
import { FollowerStatus } from '@prisma/client';
import { UserRepository } from '@/user/repositories/user';
import { UserParam } from '../params/user';
import { FollowerListResponse, FollowerUserResponse } from '../dto';

@Injectable()
export class GetFollowerListUseCase {
  constructor(
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
    perPage: number = 20,
    page: number = 1,
  ): Promise<FollowerListResponse> {
    const followerList = await this.followerRepository.getFollowersList({
      userId,
      status: FollowerStatus.ACCEPTED,
      page,
      perPage,
    });

    const userIds: string[] = followerList.map((follower) => follower.userId);
    const users: UserParam[] = await this.userRepository.findByIdList(userIds);
    const userMaps = users.reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<string, UserParam>,
    );

    const followerUsers = followerList.map((follower) => {
      const user = userMaps[follower.userId];
      return FollowerUserResponse.from(user);
    });

    return {
      items: followerUsers,
    };
  }
}
