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
    console.log('Planting tree in DB:', plantTreeDto, 'by user:', userId);

    const treeTypeInt = plantTreeDto.treeTypeId;

    if (
      typeof treeTypeInt !== 'number' ||
      treeTypeInt < 0 ||
      treeTypeInt > 3 ||
      !Number.isInteger(treeTypeInt)
    ) {
      throw new Error(`Invalid treeType value: ${plantTreeDto.treeTypeId}`);
    }

    const plantedTree = await this.prisma.savedRestaurant.create({
      data: {
        userId: userId,
        restaurantId: plantTreeDto.restaurantId,
        treeType: treeTypeInt,
        description: '',
        review: '',
        keywords: [],
        recommendedByUsers: [],
      },
    });
    // TODO: apply NaverPlaceSearchAPI
    return plantedTree;
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
