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

  async createBulk(params: CreateBulkSearchUserTagParams) {
    return await this.prisma.searchUserTag.createMany({
      data: params.names.map((name) => ({
        id: uuid(),
        userId: params.userId,
        name,
      })),
    });
  }

  async getList(query: string): Promise<SearchUserTag[]> {
    return await this.prisma.searchUserTag.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }

  async deleteByUserId(userId: string) {
    await this.prisma.searchUserTag.deleteMany({
      where: {
        userId,
      },
    });
  }
}
