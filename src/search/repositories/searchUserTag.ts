import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreateBulkSearchUserTagParams,
  CreateSearchUserTagParams,
} from '../params/searchUser';
import { v7 as uuid } from 'uuid';
import { SearchUserTag } from '@prisma/client';

@Injectable()
export class SearchUserTagRepository {
  constructor(private prisma: PrismaService) {}

  async create(params: CreateSearchUserTagParams) {
    const id = uuid();
    return await this.prisma.searchUserTag.create({
      data: {
        id,
        userId: params.userId,
        name: params.name,
      },
    });
  }

  private async getListByQuery(
    query: string,
    page: number,
    perPage: number,
    select: { userId?: boolean } | undefined = undefined,
  ) {
    return await this.prisma.searchUserTag.findMany({
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

  async createBulk(params: CreateBulkSearchUserTagParams) {
    return await this.prisma.searchUserTag.createMany({
      data: params.names.map((name) => ({
        id: uuid(),
        userId: params.userId,
        name,
      })),
    });
  }

  async getList(
    query: string,
    page: number,
    perPage: number,
  ): Promise<SearchUserTag[]> {
    return (await this.getListByQuery(query, page, perPage)) as SearchUserTag[];
  }

  async getIdList(
    query: string,
    page: number,
    perPage: number,
  ): Promise<string[]> {
    const resp = await this.getListByQuery(query, page, perPage, {
      userId: true,
    });
    return resp.map((tag) => tag.userId);
  }

  async deleteByUserId(userId: string) {
    await this.prisma.searchUserTag.deleteMany({
      where: {
        userId,
      },
    });
  }
}
