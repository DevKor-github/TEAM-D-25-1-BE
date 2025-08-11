import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateUserParam,
  UpdateUserParam,
  UpdateFcmTokenParam,
  UserParam,
} from '@/user/params/user';
import { User, SocialProvider } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  // 사용자를 생성합니다. UUID를 사용하여 고유한 식별자를 생성합니다.
  async create(param: CreateUserParam): Promise<UserParam> {
    const id = uuidv7();
    const user = await this.prisma.user.create({
      data: {
        ...param,
        id,
        isOnboarded: false,
      },
    });
    return this.mapToUserParam(user);
  }

  async findById(id: string): Promise<UserParam | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.mapToUserParam(user) : null;
  }

  // 이메일을 기반으로 사용자를 찾습니다.
  async findByEmail(email: string): Promise<UserParam | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.mapToUserParam(user) : null;
  }

  // 사용자 정보를 업데이트합니다.
  async update(id: string, param: UpdateUserParam): Promise<UserParam> {
    const user = await this.prisma.user.update({
      where: { id },
      data: param,
    });
    return this.mapToUserParam(user);
  }

  // FCM 토큰을 업데이트합니다.
  async updateFcmToken(
    id: string,
    param: UpdateFcmTokenParam,
  ): Promise<UserParam> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        fcmToken: param.fcmToken,
        fcmTokenUpdatedAt: new Date(),
      },
    });
    return this.mapToUserParam(user);
  }

  async updateProfileImageUrl(
    id: string,
    profileImageUrl: string,
  ): Promise<UserParam> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        profileImageUrl,
      },
    });
    return this.mapToUserParam(user);
  }

  // 사용자를 삭제합니다.
  async delete(id: string): Promise<UserParam> {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return this.mapToUserParam(user);
  }

  // 모든 사용자를 조회합니다.
  async findAll(): Promise<UserParam[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.mapToUserParam(user));
  }

  async findByIdList(ids: string[]): Promise<UserParam[]> {
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    const resultMap = users.reduce(
      (acc, user) => {
        acc[user.id] = this.mapToUserParam(user);
        return acc;
      },
      {} as Record<string, UserParam>,
    );

    return ids.map((id) => resultMap[id]);
  }

  private mapToUserParam(user: User): UserParam {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      username: user.username,
      nickname: user.nickname,
      password: user.password,
      socialProvider: user.socialProvider as SocialProvider,
      socialId: user.socialId,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      profileImageUrl: user.profileImageUrl,
      fcmToken: user.fcmToken,
      fcmTokenUpdatedAt: user.fcmTokenUpdatedAt,
      lastWatered: user.lastWatered
    };
  }
}
