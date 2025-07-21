import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TreeRepository } from './repository';
import { Coordinate, PlantTreeDto, TreeDetailResponse } from './dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TreeDetail } from './types';

const toTreeDetailResponse = (detail: TreeDetail): TreeDetailResponse => {
  if (!detail.tree || !detail.restaurant) return null;
  return {
    treeId: `${detail.tree.userId}_${detail.tree.restaurantId}`,
    name: detail.restaurant.name,
    address: detail.restaurant.address,
    latitude: String(detail.restaurant.latitude),
    longitude: String(detail.restaurant.longitude),
    treeType: detail.tree.treeType,
    review: detail.tree.review,
    description: detail.tree.description,
    tags: detail.tree.tag,
    createdAt: detail.tree.createdAt,
    updatedAt: detail.tree.updatedAt,
    recommendationCount: detail.tree.recommendedByUsers.length,
  };
};

@Injectable()
export class TreeService {
  constructor(
    private readonly treeRepository: TreeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getFollowersTree(
    userId: string,
    restaurantId: string,
  ): Promise<TreeDetailResponse[]> {
    const friendsTrees = await this.treeRepository.getFollowersTree(
      userId,
      restaurantId,
    );
    return friendsTrees.map(toTreeDetailResponse);
  }

  async getTreesByLocation(
    userId: string,
    zoom: number,
    location: Coordinate,
  ): Promise<TreeDetailResponse[]> {
    console.log('Getting trees by location:', location);
    const data = await this.treeRepository.getTreesByLocation(
      userId,
      zoom,
      location,
    );

    return data.map(toTreeDetailResponse).filter(Boolean);
  }

  async getTreeById(
    treeId: string,
    userId: string,
  ): Promise<TreeDetailResponse> {
    const [ownerId, restaurantId] = treeId.split('_');

    let isAllowed = false;
    if (ownerId === userId) isAllowed = true;
    else {
      const relation = await this.prisma.follower.findUnique({
        where: {
          userId_followerId: {
            userId: ownerId,
            followerId: userId,
          },
          status: 'ACCEPTED',
        },
      });

      if (relation) isAllowed = true;
    }

    if (!isAllowed)
      throw new ForbiddenException('이 나무에 접근할 수 없습니다.');

    const treeData = await this.treeRepository.getTreeById(
      ownerId,
      restaurantId,
    );
    if (!treeData)
      throw new NotFoundException('해당하는 나무를 찾을 수 없습니다.');

    return toTreeDetailResponse(treeData);
  }

  async getTreesByRestaurantId(
    restaurantId: string,
    userId: string,
  ): Promise<TreeDetailResponse[]> {
    const followings = await this.prisma.follower.findMany({
      where: { followerId: userId, status: 'ACCEPTED' },
      select: { userId: true },
    });
    const followingIds = followings.map((e) => e.userId);
    const targetUids = [...followingIds, userId];
    const treeDatas = await this.treeRepository.getTreesByRestaurantId(
      restaurantId,
      targetUids,
    );
    return treeDatas.map(toTreeDetailResponse);
  }

  async waterTree(treeId: string, userId: string): Promise<TreeDetailResponse> {
    const { lastWatered = new Date(0) } = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastWatered: true },
    });

    if (Date.now() - lastWatered.getTime() < 4 * 60 * 60 * 1000) {
      throw new BadRequestException({
        message: '아직 물을 줄 수 없습니다.',
        lastWatered,
      });
    }
    const parts = treeId.split('_');
    const [ownerId, restaurantId] = parts;
    if (ownerId === userId)
      throw new BadRequestException('자신의 나무에는 물을 줄 수 없습니다.');

    const result = await this.treeRepository.waterTree(
      ownerId,
      restaurantId,
      userId,
    );
    return toTreeDetailResponse(result);
  }

  async plantTree(
    plantTreeDto: PlantTreeDto,
    userId: string,
  ): Promise<{ treeId: string }> {
    const { restaurantId } = plantTreeDto;

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant)
      throw new NotFoundException('존재하지 않는 Restaurant입니다.');

    const existingTree = await this.prisma.savedRestaurant.findUnique({
      where: { userId_restaurantId: { userId, restaurantId } },
    });
    if (existingTree)
      throw new ConflictException('이미 나무를 심은 Restaurant입니다.');

    const newTree = await this.treeRepository.plantTree(plantTreeDto, userId);
    return {
      treeId: `${newTree.userId}_${newTree.restaurantId}`,
    };
  }

  async getRecommendations(): Promise<TreeDetailResponse[]> {
    // AI 관련 추천 추가 필요 on Service단
    console.log('Getting recommendations');
    const recommendations = await this.treeRepository.getRecommendations();
    return recommendations.map(toTreeDetailResponse);
  }
}
