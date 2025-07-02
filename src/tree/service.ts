import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TreeRepository } from './repository';
import { Coordinate, PlantTreeDto } from './dto';
import { SavedRestaurant, Restaurant, User } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { TreeDetail } from './types';

@Injectable()
export class TreeService {
  constructor(
    private readonly treeRepository: TreeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getFollowersTree(
    userId: string,
    restaurantId: string,
  ): Promise<SavedRestaurant[]> {
    console.log(
      'Getting all friends trees for user:',
      userId,
      'at restaurant:',
      restaurantId,
    );
    const friendsTrees = await this.treeRepository.getFollowersTree(
      userId,
      restaurantId,
    );
    return friendsTrees;
  }

  async getTreesByLocation(
    userId: string,
    zoom: number,
    location: Coordinate,
  ): Promise<Restaurant[]> {
    console.log('Getting trees by location:', location);
    const result = await this.treeRepository.getTreesByLocation(
      userId,
      zoom,
      location,
    );
    return result;
  }

  async getTreeById(
    treeId: string,
    userId: string,
  ): Promise<TreeDetail | null> {
    const parts = treeId.split('_');
    const [ownerId, restaurantId] = parts;

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

      // FIXME: 태현이가 보고 수정 필요함 
      if (!relation) isAllowed = false;
    }

    if (!isAllowed)
      throw new ForbiddenException('이 나무에 접근할 수 없습니다.');

    const tree = await this.treeRepository.getTreeById(ownerId, restaurantId);
    if (!tree) throw new NotFoundException('해당하는 나무를 찾을 수 없습니다.');

    return tree;
  }

  async getTreesByRestaurantId(
    restaurantId: string,
    userId: string,
  ): Promise<TreeDetail[]> {
    const followings = await this.prisma.follower.findMany({
      where: { followerId: userId, status: 'ACCEPTED' },
      select: { userId: true },
    });
    const followingIds = followings.map((e) => e.userId);

    const targetUids = [...followingIds, userId];

    return this.treeRepository.getTreesByRestaurantId(restaurantId, targetUids);
  }

  async waterTree(
    restaurantId: string,
    userId: string,
  ): Promise<SavedRestaurant | null> {
    console.log('Watering tree:', restaurantId, 'by user:', userId);
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

    const result = await this.treeRepository.waterTree(restaurantId, userId);
    return result;
  }

  async plantTree(
    plantTreeDto: PlantTreeDto,
    userId: string,
  ): Promise<SavedRestaurant & { warnings?: string[] }> {
    const { tagIds, restaurantId } = plantTreeDto;
    const warnings: string[] = [];

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });
    if (!restaurant)
      throw new NotFoundException(
        `Id: ${restaurantId}에 해당하는 식당을 찾을 수 없습니다.`,
      );

    const uniqueTagIds = [...new Set(tagIds)];
    if (uniqueTagIds.length !== tagIds.length)
      warnings.push('중복된 태그가 있어 자동으로 제거하였습니다.');

    const validTags = await this.prisma.tag.findMany({
      where: { id: { in: uniqueTagIds } },
      select: { id: true },
    });
    const validTagIds = validTags.map((e) => e.id);

    if (validTagIds.length !== uniqueTagIds.length)
      warnings.push(`존재하지 않는 태그가 감지되어 자동으로 제거하였습니다.`);

    const processedDto: PlantTreeDto = {
      ...plantTreeDto,
      tagIds: validTagIds,
    };

    const res: SavedRestaurant & { warnings?: string[] } =
      await this.treeRepository.plantTree(processedDto, userId);
    if (warnings.length > 0) res.warnings = warnings;

    return res;
  }

  async getRecommendations(): Promise<SavedRestaurant[]> {
    // AI 관련 추천 추가 필요 on Service단
    console.log('Getting recommendations');
    const recommendations = await this.treeRepository.getRecommendations();
    return recommendations;
  }
}
