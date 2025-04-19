import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Restaurant } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

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
