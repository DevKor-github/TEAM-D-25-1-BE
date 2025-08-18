import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Restaurant, SavedRestaurant, User } from '@prisma/client';
import { Coordinate, PlantTreeDto } from './dto';
import { TreeDetail } from './types';
import { getTreeLevel, TREE_TYPES_MAP } from './constants';

const MIN_ZOOM_LEVEL = 11;

@Injectable()
export class TreeRepository {
  constructor(private readonly prisma: PrismaService) {}

  public zoomToRadius(zoom: number): number {
    switch (true) {
      case zoom >= 18:
        return 0.3;
      case zoom >= 15:
        return 0.7;
      case zoom >= 12:
        return 2;
      case zoom >= 9:
        return 5;
      case zoom >= 6:
        return 20;
      default:
        return 50;
    }
  }

  public getBoundBox(center: { lat: number; lon: number }, radiusKm: number) {
    const { lat, lon } = center;
    const KILOMETERS_PER_LATITUDE_DEGREE = 110.574;
    const latRadian = (Math.PI * lat) / 180;
    const KILOMETERS_PER_LONGITUDE_DEGREE = 111.32 * Math.cos(latRadian);

    const latDelta = radiusKm / KILOMETERS_PER_LATITUDE_DEGREE;
    const lonDelta = radiusKm / KILOMETERS_PER_LONGITUDE_DEGREE;

    const latMin = lat - latDelta;
    const latMax = lat + latDelta;
    const lonMin = lon - lonDelta;
    const lonMax = lon + lonDelta;

    return { latMin, latMax, lonMin, lonMax };
  }

  private toTreeDetail(
    prismaRes: SavedRestaurant & { user: User; restaurant: Restaurant },
  ): TreeDetail {
    const { user, restaurant, ...tree } = prismaRes;
    const { recommendedByUsers, treeType } = tree
    const treeData = TREE_TYPES_MAP[treeType ?? 0];
    const height = recommendedByUsers?.length ?? 0
    const treeLevelData = treeData.levels[getTreeLevel(height + 1) - 1]

    return {
      user,
      restaurant,
      tree: {
        ...tree,
        level: treeLevelData.level,
        imageUrl: treeLevelData.imageUrl,
        treeTypeName: treeData.name
      }
    };
  }

  async getTreesByLocation(
    userId: string | undefined,
    zoom: number,
    location: Coordinate,
  ): Promise<TreeDetail[]> {
    if (zoom < MIN_ZOOM_LEVEL) return [];

    let searchTargetIds: string[] = [];
    if (userId) {
      const following = await this.prisma.follower.findMany({
        where: {
          followerId: userId,
          status: 'ACCEPTED',
        },
        select: { userId: true },
      });
      const followingIds = following.map((e) => e.userId);
      searchTargetIds = [...followingIds, userId];
    }

    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    const radius = this.zoomToRadius(zoom);
    const boundery = this.getBoundBox({ lat, lon }, radius);

    const res = await this.prisma.savedRestaurant.findMany({
      where: {
        userId:
          searchTargetIds.length > 0 ? { in: searchTargetIds } : undefined,
        restaurant: {
          latitude: { gte: boundery.latMin, lte: boundery.latMax },
          longitude: { gte: boundery.lonMin, lte: boundery.lonMax },
        },
      },
      include: {
        restaurant: true,
        user: true,
      },
    });

    return res.map((e) => this.toTreeDetail(e));
  }

  async getTreesByRestaurantId(
    restaurantId: string,
    targetUids: string[],
  ): Promise<TreeDetail[]> {
    const res = await this.prisma.savedRestaurant.findMany({
      where: {
        restaurantId: restaurantId,
        userId: { in: targetUids },
      },
      include: {
        user: true,
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.map((e) => this.toTreeDetail(e));
  }

  async getTreeById(
    ownerId: string,
    restaurantId: string,
  ): Promise<TreeDetail | null> {
    const res = await this.prisma.savedRestaurant.findUnique({
      where: {
        userId_restaurantId: {
          userId: ownerId,
          restaurantId: restaurantId,
        },
      },
      include: {
        user: true,
        restaurant: true,
      },
    });
    return res ? this.toTreeDetail(res) : null;
  }

  async waterTree(
    ownerId: string,
    restaurantId: string,
    userId: string,
  ): Promise<TreeDetail | null> {
    const updatedData = await this.prisma.savedRestaurant.update({
      where: {
        userId_restaurantId: { userId: ownerId, restaurantId: restaurantId },
        /*
        NOT: {
          recommendedByUsers: { has: userId }
        } 필터링 로직 수정 (쿼리 단순화)
        */
      },
      data: {
        recommendedByUsers: { push: userId },
      },
      include: {
        user: true,
        restaurant: true,
      },
    });

    return this.toTreeDetail(updatedData);
  }

  async plantTree(
    plantTreeDto: PlantTreeDto,
    userId: string,
  ): Promise<SavedRestaurant> {
    const { restaurantId, treeType, review, tags, images } = plantTreeDto;

    return await this.prisma.savedRestaurant.create({
      data: {
        userId,
        restaurantId,
        treeType,
        review,
        tag: tags,
        images,
        recommendedByUsers: [],
      },
    });
  }

  async getRecommendations(): Promise<TreeDetail[]> {
    console.log('Getting recommendations from DB');
    return [];
  }

  // TODO: Service단으로 리팩토링
  async getFollowersTree(
    userId: string,
    restaurantId: string,
  ): Promise<TreeDetail[]> {
    const followers = await this.prisma.follower.findMany({
      where: { userId, status: 'ACCEPTED' },
      select: { followerId: true },
    });
    const followerUserId = followers.map((f) => f.followerId);

    const followerTreeData = await this.prisma.savedRestaurant.findMany({
      where: {
        userId: { in: followerUserId },
        restaurantId: restaurantId,
      },
      include: { user: true, restaurant: true },
    });
    return followerTreeData.map((e) => this.toTreeDetail(e));
  }

  async getMyTrees(
    userId: string,
  ): Promise<(SavedRestaurant & { restaurant: Restaurant })[]> {
    const res = await this.prisma.savedRestaurant.findMany({
      where: { userId },
      include: { restaurant: true },
    });
    return res;
  }

  // TODO: Relation 추가
  async getWateredTrees(
    userId: string,
  ): Promise<(SavedRestaurant & { restaurant: Restaurant })[]> {
    const res = await this.prisma.savedRestaurant.findMany({
      where: { recommendedByUsers: { has: userId } },
      include: { restaurant: true },
    });
    return res;
  }

  async getTreeCounts(userId: string): Promise<number> {
    return await this.prisma.savedRestaurant.count({
      where: { userId },
    });
  }
}
