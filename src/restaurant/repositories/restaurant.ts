import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Restaurant } from '@prisma/client';
import { RestaurantEntity } from '../entity';

@Injectable()
export class RestaurantRepository {
  constructor(private prisma: PrismaService) {}

  private mapToRestaurantEntity(restaurant: Restaurant): RestaurantEntity {
    return {
      id: restaurant.id,
      placeId: restaurant.placeId,
      name: restaurant.name,
      address: restaurant.address,
      latitude: restaurant.latitude.toString(),
      longitude: restaurant.longitude.toString(),
      createdAt: restaurant.createdAt,
    };
  }

  async getAllRestaurants(
    perPage: number = 1,
    page: number = 10,
  ): Promise<Restaurant[]> {
    const restaurants = await this.prisma.restaurant.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        id: 'desc',
      },
    });

    return restaurants;
  }

  async getRestaurantsByIds(ids: string[]): Promise<RestaurantEntity[]> {
    const results = await this.prisma.restaurant.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    const resultMap = results.reduce(
      (acc, restaurant) => {
        acc[restaurant.id] = restaurant;
        return acc;
      },
      {} as Record<string, Restaurant>,
    );

    return ids.map((id) => this.mapToRestaurantEntity(resultMap[id]));
  }

  // Return the total number of restaurants
  async getRestaurantsCount(): Promise<number> {
    return this.prisma.restaurant.count();
  }
}
