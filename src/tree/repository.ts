import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Restaurant, SavedRestaurant, User } from '@prisma/client';
import { Coordinate, PlantTreeDto } from './dto';
import { TreeDetail } from './types';

@Injectable()
export class TreeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly MIN_ZOOM_LEVEL = 11
  ) {}

  public zoomToRadius(zoom: number): number{
    switch(true){
      case zoom >= 18:
        return 0.3
      case zoom >= 15:
        return 0.7
      case zoom >= 12:
        return 2
      case zoom >= 9:
        return 5
      case zoom >= 6:
        return 20
      default:
        return 50
    }
  }

  public getBoundBox(
    center: { lat: number; lon: number },
    radiusKm: number
  ){
    const { lat, lon } = center
    const KILOMETERS_PER_LATITUDE_DEGREE = 110.574
    const latRadian = (Math.PI * lat) / 180
    const KILOMETERS_PER_LONGITUDE_DEGREE = 111.32 * Math.cos(latRadian)

    const latDelta = radiusKm / KILOMETERS_PER_LATITUDE_DEGREE
    const lonDelta = radiusKm / KILOMETERS_PER_LONGITUDE_DEGREE

    const latMin = lat - latDelta
    const latMax = lat + latDelta
    const lonMin = lon - lonDelta
    const lonMax = lon + lonDelta

    return { latMin, latMax, lonMin, lonMax }
  }

  private toTreeDetail(
    prismaRes: SavedRestaurant & { user: User; restaurant: Restaurant },
  ): TreeDetail {
    const { user, restaurant, ...tree } = prismaRes
    return {
      user,
      restaurant,
      tree,
    }
  }

  async getTreesByLocation(
    userId: string,
    zoom: number,
    location: Coordinate,
  ): Promise<Restaurant[]> {
    if (zoom < this.MIN_ZOOM_LEVEL) return [];

    const following = await this.prisma.follower.findMany({
      where: {
        followerId: userId,
        status: 'ACCEPTED'
      },
      select: { userId: true }
    })

    const followingIds = following.map((e) => e.userId)
    const searchTargetIds = [...followingIds, userId]
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    const radius = this.zoomToRadius(zoom)
    const boundery = this.getBoundBox({ lat, lon }, radius)

    const res = await this.prisma.restaurant.findMany({
      where: {
        latitude: { gte: boundery.latMin, lte: boundery.latMax },
        longitude: { gte: boundery.lonMin, lte: boundery.lonMax },
      },
      include: {
        savedBy: {
          where: {
            userId: { in: searchTargetIds },
          },
          include: {
            user: { select: { id: true } },
          }
        }
      }
    })

    return res
  }

  async getTreesByRestaurantId(
    restaurantId: string,
    targetUids: string[]
  ): Promise<TreeDetail[]>{
    const res = await this.prisma.savedRestaurant.findMany({
      where: { 
        restaurantId: restaurantId, 
        userId: { in: targetUids }
      },
      include: {
        user: true,
        restaurant: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.map(this.toTreeDetail)
  }

  async getTreeById(
    ownerId: string,
    restaurantId: string
  ): Promise<TreeDetail | null>{
    const res = await this.prisma.savedRestaurant.findUnique({
      where:{
        userId_restaurantId: {
          userId: ownerId,
          restaurantId: restaurantId
        }
      },
      include: {
        user: true,
        restaurant: true
      }
    })
    return res ? this.toTreeDetail(res) : null
  }

  async waterTree(
    restaurantId: string,
    userId: string,
  ): Promise<SavedRestaurant | null> {
    console.log(
      'Watering tree (SavedRestaurant) for restaurant:',
      restaurantId,
      'by user:',
      userId,
    );

    const savedRestaurant = await this.prisma.savedRestaurant.findUnique({
      where: {
        userId_restaurantId: { userId: userId, restaurantId: restaurantId },
      },
      select: { recommendedByUsers: true },
    });

    if (!savedRestaurant) {
      return null;
    }
    /*
    if ((savedRestaurant.recommendedByUsers as string[]).includes(userId)) {
      console.log('User already watered this tree.');
      return this.prisma.savedRestaurant.findUnique({
        where: {
          userId_restaurantId: { userId: userId, restaurantId: restaurantId },
        },
      });
    } */

    const updatedSavedTree = await this.prisma.savedRestaurant.update({
      where: {
        userId_restaurantId: { userId: userId, restaurantId: restaurantId },
      },
      data: {
        recommendedByUsers: { push: userId },
      },
    });

    return updatedSavedTree;
  }

  async plantTree(
    plantTreeDto: PlantTreeDto,
    userId: string,
  ): Promise<SavedRestaurant> {
    const { 
      restaurantId, 
      treeTypeId, 
      review, 
      tagIds,
      description 
    } = plantTreeDto

    const plantedTree = await this.prisma.savedRestaurant.create({
      data: {
        userId,
        restaurantId,
        treeType: treeTypeId,
        description,
        review
      },
    });

    if (tagIds.length > 0){
      await this.prisma.savedRestaurantTag.createMany({
        data: tagIds.map(tagId => ({ userId, restaurantId, tagId })),
        skipDuplicates: true        
      })
    }

    return { ...plantedTree, tagIds } as SavedRestaurant & { tagIds: number[]};
  }

  async getRecommendations(): Promise<SavedRestaurant[]> {
    console.log('Getting recommendations from DB');
    return [];
  }

  // TODO: Service단으로 리팩토링
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

    const followers = await this.prisma.follower.findMany({
      where: { userId: userId },
      select: { followerId: true },
    });
    const followerUserId = followers.map((f) => f.followerId);

    const followerTrees = await this.prisma.savedRestaurant.findMany({
      where: {
        userId: { in: followerUserId },
        restaurantId: restaurantId,
      },
      include: { user: true, restaurant: true },
    });
    return followerTrees;
  }
}
