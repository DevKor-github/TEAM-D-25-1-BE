import { Injectable } from '@nestjs/common';
import { FollowerRepository } from '@/user/repositories/follower';
import { FollowerStatus } from '@prisma/client';
import { UserRepository } from '@/user/repositories/user';
import { UserParam } from '../params/user';
import { FollowingListResponse, FollowingUserResponse } from '../dto';

@Injectable()
export class GetFollowingListUseCase {
  constructor(
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
    perPage: number = 20,
    page: number = 1,
  ): Promise<FollowingListResponse> {
    const followingList = await this.followerRepository.getFollowingList({
      userId,
      status: FollowerStatus.ACCEPTED,
      page,
      perPage,
    });

    // ensure following instance order
    const userIds: string[] = followingList.map(
      (following) => following.userId,
    );
    const users: UserParam[] = await this.userRepository.findByIdList(userIds);
    const userMaps = users.reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<string, UserParam>,
    );

    const followingUsers = followingList.map((following) => {
      const user = userMaps[following.userId];
      return FollowingUserResponse.from(user);
    });

    return {
      items: followingUsers,
    };
  }
}
