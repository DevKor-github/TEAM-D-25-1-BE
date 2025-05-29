import { Injectable } from '@nestjs/common';
import { FollowerRepository } from '@/user/repositories/follwer';
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
    const followingList = await this.followerRepository.getFollowersList({
      userId,
      status: FollowerStatus.ACCEPTED,
      page,
      perPage,
    });

    const userIds: string[] = followingList.map(
      (following) => following.followerId,
    );
    const users: UserParam[] = await this.userRepository.findByIds(userIds);
    const userMaps = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    const followingUsers = followingList.map((following) => {
      const user = userMaps[following.followerId];
      return FollowingUserResponse.from(user);
    });

    return {
      items: followingUsers,
    };
  }
}
