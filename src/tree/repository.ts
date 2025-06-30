import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Restaurant, SavedRestaurant, User } from '@prisma/client';
import { Coordinate, PlantTreeDto } from './dto';

@Injectable()
export class TreeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly MIN_ZOOM_LEVEL = 15
  ) {}

  private zoomToRadius(zoom: number): number{
    if (zoom >= 16) return 1;
    if (zoom >= 15) return 2;
    return 3;
  }

  // TODO: 범위 부분 Service단으로 빼기
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
    const [ lat, lon ] = [parseFloat(location.lat), parseFloat(location.lon)]

    const radius = this.zoomToRadius(zoom)
    const latRadian = (Math.PI * lat) / 180;
    const degLat = 110.574; // 위도 1도의 km
    const degLon = 111.32 * Math.cos(latRadian);

    const latMin = lat - radius / degLat;
    const latMax = lat + radius / degLat;
    const lonMin = lon - radius / degLon;
    const lonMax = lon + radius / degLon;

    const restaurants = await this.prisma.restaurant.findMany({
      where: {
        latitude: { gte: latMin, lte: latMax },
        longitude: { gte: lonMin, lte: lonMax },
      },
      include: {
        savedBy: {
          where: {
            userId: { in: searchTargetIds }
          },
          include: {
            user: { select: { id: true }},
          },
        }
      }
    })

    return restaurants;
  }

  async getTreesByRestaurantId(
    restaurantId: string,
    targetUids: string[]
  ): Promise<(SavedRestaurant & { user: User; restaurant: Restaurant })[]>{
    return this.prisma.savedRestaurant.findMany({
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
  }

  async getTreeById(
    ownerId: string,
    restaurantId: string
  ): Promise<(SavedRestaurant & { user: User; restaurant: Restaurant }) | null>{
    const tree = await this.prisma.savedRestaurant.findUnique({
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
    return tree
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
