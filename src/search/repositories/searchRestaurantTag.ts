import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreateBulkSearchRestaurantTagParams,
  CreateSearchRestaurantTagParams,
} from '../params/searchRestaurant';
import { v7 as uuid } from 'uuid';
import { SearchRestaurantTag } from '@prisma/client';

// interface SearchRestaurantTagInclude {
//   restaurantId?: boolean;
// }

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

  private async getListByQuery(
    query: string,
    page: number,
    perPage: number,
    select: { restaurantId?: boolean } | undefined = undefined,
  ) {
    return await this.prisma.searchRestaurantTag.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
      select,
    });
  }

  // FIXME: Change this code to use FTS search
  async getList(
    query: string,
    page: number,
    perPage: number,
  ): Promise<SearchRestaurantTag[]> {
    return (await this.getListByQuery(
      query,
      page,
      perPage,
    )) as SearchRestaurantTag[]; // FIXME: not that good patter
  }

  async getIdList(
    query: string,
    page: number,
    perPage: number,
  ): Promise<string[]> {
    const resp = await this.getListByQuery(query, page, perPage, {
      restaurantId: true,
    });
    return resp.map((tag) => tag.restaurantId);
  }

  async getListByRestaurantId(
    restaurantId: string,
  ): Promise<SearchRestaurantTag[]> {
    return await this.prisma.searchRestaurantTag.findMany({
      where: {
        restaurantId,
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
