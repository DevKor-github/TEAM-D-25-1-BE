import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateUserParam,
  UpdateUserParam,
  UserParam,
} from '@/user/params/user';
import { User } from '@prisma/client';
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

  private mapToUserParam(user: User): UserParam {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      nickname: user.nickname,
      password: user.password,
      socialProvider: user.socialProvider,
      socialId: user.socialId,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
    };
  }
}
