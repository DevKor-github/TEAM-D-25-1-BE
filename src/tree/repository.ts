import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Restaurant, SavedRestaurant, User } from '@prisma/client';
import { Coordinate, PlantTreeDto } from './dto';

@Injectable()
export class TreeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTreesByLocation(
    location: Coordinate,
  ): Promise<(Restaurant & { savedBy: SavedRestaurant[] })[]> {
    console.log('Getting restaurants by location from DB:', location);
    // TODO: Prisma 기반?
    return [];
  }

  async getTreeById(
    restaurantId: string,
    userId: string,
  ): Promise<
    (SavedRestaurant & { user: User; restaurant: Restaurant }) | null
  > {
    console.log(
      'Getting tree (SavedRestaurant) for restaurant:',
      restaurantId,
      'by user:',
      userId,
    );
    const tree = await this.prisma.savedRestaurant.findUnique({
      where: {
        userId_restaurantId: { userId: userId, restaurantId: restaurantId },
      },
      include: {
        user: true,
        restaurant: true,
      },
    });
    return tree;
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
