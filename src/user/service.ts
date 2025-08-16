import { Injectable, NotFoundException } from '@nestjs/common';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';
import {
  MypageResponse,
  RestaurantListResponse,
  RestaurantResponse,
  MypageTreeResponse,
} from './dto';
import { Restaurant } from '@prisma/client';
import { UserParam } from './params/user';
import { TreeRepository } from '@/tree/repository';
import { GetFollowerCountUsecase } from './usecases/getFollowerCount';
import { GetFollowingCountUsecase } from './usecases/getFollowingCount';
import { UserRepository } from './repositories/user';
import { getBiggestTrees, getRecapDescription } from './tree.util';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly treeRepository: TreeRepository,
    private readonly getFollowerCount: GetFollowerCountUsecase,
    private readonly getFollowingCount: GetFollowingCountUsecase,
  ) {}

  async getRestaurantList(
    perPage: number,
    page: number,
  ): Promise<RestaurantListResponse> {
    const pageContents: Restaurant[] =
      await this.restaurantRepository.getAllRestaurants(perPage, page);

    const totals = await this.restaurantRepository.getRestaurantsCount();
    const totalPages = Math.ceil(totals / perPage);

    return {
      items: pageContents.map(RestaurantResponse.from),
      totalPages,
    } satisfies RestaurantListResponse;
  }

  async getMypage(user: UserParam): Promise<MypageResponse> {
    const userTree = await this.treeRepository.getMyTrees(user.id) || [];
    const wateredTrees = await this.treeRepository.getWateredTrees(user.id) || [];
    const followerCount = await this.getFollowerCount.execute(user.id);
    const followingCount = await this.getFollowingCount.execute(user.id);
    const treeCount = await this.treeRepository.getTreeCounts(user.id);
    const { recapMessage, recapImageUrl } = getRecapDescription(treeCount);
    const biggestTrees = getBiggestTrees(userTree)

    return {
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      profileImage: user.profileImageUrl,
      tags: user.tag,
      mbti: user.mbti,
      followerCount,
      followingCount,
      treeCount,
      recapMessage, recapImageUrl,
      biggestTrees: biggestTrees.length > 0
        ? biggestTrees.map((e) => new MypageTreeResponse(e))
        : null,
      myTrees: userTree.length > 0
        ? userTree.map((e) => new MypageTreeResponse(e)) 
        : null,
      wateredTrees: wateredTrees.length > 0
        ? wateredTrees.map((e) => new MypageTreeResponse(e))
        : null,
    };
  }

  async getUser(userId: string): Promise<UserParam> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
