import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreateBulkSearchRestaurantTagParams,
  CreateSearchRestaurantTagParams,
} from '../params/searchRestaurant';
import { v7 as uuid } from 'uuid';
import { SearchRestaurantTag } from '@prisma/client';

@Injectable()
export class SearchRestaurantTagRepository {
  constructor(private prisma: PrismaService) {}

  async create(params: CreateSearchRestaurantTagParams) {
    // FIXME: return type
    return await this.prisma.searchRestaurantTag.create({
      data: {
        id: uuid(),
        restaurantId: params.restaurantId,
        name: params.name,
      },
    });
  }

  async createBulk(params: CreateBulkSearchRestaurantTagParams) {
    return await this.prisma.searchRestaurantTag.createMany({
      data: params.names.map((name) => ({
        id: uuid(),
        restaurantId: params.restaurantId,
        name,
      })),
    });
  }

  async getList(query: string): Promise<SearchRestaurantTag[]> {
    return await this.prisma.searchRestaurantTag.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }

  async deleteByRestaurantId(restaurantId: string) {
    await this.prisma.searchRestaurantTag.deleteMany({
      where: {
        restaurantId,
      },
    });
  }
}
