import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Restaurant } from '@prisma/client';

@Injectable()
export class RestaurantRepository {
  constructor(private prisma: PrismaService) {}

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

  // Return the total number of restaurants
  async getRestaurantsCount(): Promise<number> {
    return this.prisma.restaurant.count();
  }
}
