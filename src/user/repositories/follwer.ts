import { FollowerStatus, PrismaClient } from '@prisma/client';
import {
  CreateFollowerParams,
  UpdateFollowerParams,
  GetFollowerParams,
  GetFollowersListParams,
} from '@/user/params/follower';

export class FollowerRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createFollower(params: CreateFollowerParams) {
    return this.prisma.follower.create({
      data: {
        userId: params.userId,
        followerId: params.followerId,
        status: params.status || FollowerStatus.PENDING,
      },
    });
  }

  async updateFollowerStatus(
    userId: string,
    followerId: string,
    params: UpdateFollowerParams,
  ) {
    return this.prisma.follower.update({
      where: {
        userId_followerId: {
          userId,
          followerId,
        },
      },
      data: {
        status: params.status,
      },
    });
  }

  async getFollower(params: GetFollowerParams) {
    return this.prisma.follower.findUnique({
      where: {
        userId_followerId: {
          userId: params.userId,
          followerId: params.followerId,
        },
      },
    });
  }

  async getFollowersList(params: GetFollowersListParams) {
    return this.prisma.follower.findMany({
      where: {
        userId: params.userId,
        ...(params.status && { status: params.status }),
      },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
    });
  }

  async deleteFollower(userId: string, followerId: string) {
    return this.prisma.follower.delete({
      where: {
        userId_followerId: {
          userId,
          followerId,
        },
      },
    });
  }

  async getPendingFollowers(userId: string) {
    return this.prisma.follower.findMany({
      where: {
        userId,
        status: FollowerStatus.PENDING,
      },
    });
  }

  async getAcceptedFollowers(userId: string) {
    return this.prisma.follower.findMany({
      where: {
        userId,
        status: FollowerStatus.ACCEPTED,
      },
    });
  }
}
