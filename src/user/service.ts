import { Injectable } from '@nestjs/common';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';
import { MypageResponse, RestaurantListResponse, RestaurantResponse, SimpleTreeResponse } from './dto';
import { Restaurant } from '@prisma/client';
import { UserParam } from './params/user';
import { TreeRepository } from '@/tree/repository';

@Injectable()
export class UserService {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly treeRepository: TreeRepository,
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
    const userTree = await this.treeRepository.getMyTrees(user.id);
    const wateredTrees = await this.treeRepository.getWateredTrees(user.id);
    
    let biggestTree = null;
    if (userTree && userTree.length > 0) {
      biggestTree = userTree.sort((a, b) => b.recommendedByUsers.length - a.recommendedByUsers.length)[0];
    }

    return {
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      profileImage: user.profileImageUrl,
      tags: user.tags,
      mbti: user.mbti,
      biggestTree: biggestTree ? new SimpleTreeResponse(biggestTree) : null,
      myTrees: userTree ? 
        userTree.map(
          (e) => new SimpleTreeResponse(e)
        ) : [],
      wateredTrees: wateredTrees ? 
        wateredTrees.map(
          (e) => new SimpleTreeResponse(e)
        ) : [],
    };
  }
}
