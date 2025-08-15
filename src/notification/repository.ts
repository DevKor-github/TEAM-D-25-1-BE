import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Notification, NotificationType } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import {
  CreateNotificationParam,
  UpdateNotificationParam,
  NotificationParam,
} from './params';

@Injectable()
export class NotificationRepository {
  constructor(private prisma: PrismaService) {}

  // 알림을 생성합니다.
  async create(param: CreateNotificationParam): Promise<NotificationParam> {
    const id = uuidv7();
    const notification = await this.prisma.notification.create({
      data: {
        ...param,
        id,
      },
    });
    return this.mapToNotificationParam(notification);
  }

  // ID로 알림을 찾습니다.
  async findById(id: string): Promise<NotificationParam | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    return notification ? this.mapToNotificationParam(notification) : null;
  }

  // 사용자 ID로 알림 목록을 조회합니다.
  async findByUserId(userId: string): Promise<NotificationParam[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map((notification) =>
      this.mapToNotificationParam(notification),
    );
  }

  // 사용자 ID로 알림 목록을 페이지네이션과 함께 조회합니다.
  async findByUserIdWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: NotificationParam[]; total: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications: notifications.map((notification) =>
        this.mapToNotificationParam(notification),
      ),
      total,
    };
  }

  // 알림 타입별로 조회합니다.
  async findByUserIdAndType(
    userId: string,
    type: NotificationType,
  ): Promise<NotificationParam[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId, type },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map((notification) =>
      this.mapToNotificationParam(notification),
    );
  }

  // 알림을 업데이트합니다.
  async update(
    id: string,
    param: UpdateNotificationParam,
  ): Promise<NotificationParam> {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: param,
    });
    return this.mapToNotificationParam(notification);
  }

  // 알림을 삭제합니다.
  async delete(id: string): Promise<NotificationParam> {
    const notification = await this.prisma.notification.delete({
      where: { id },
    });
    return this.mapToNotificationParam(notification);
  }

  // 사용자의 모든 알림을 삭제합니다.
  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  // 특정 타입의 알림을 삭제합니다.
  async deleteByUserIdAndType(
    userId: string,
    type: NotificationType,
  ): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { userId, type },
    });
  }

  // 사용자의 알림 개수를 조회합니다.
  async countByUserId(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId },
    });
  }

  // 특정 타입의 알림 개수를 조회합니다.
  async countByUserIdAndType(
    userId: string,
    type: NotificationType,
  ): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, type },
    });
  }

  // 최근 알림을 조회합니다 (전체 사용자 대상).
  async findRecent(limit: number = 10): Promise<NotificationParam[]> {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return notifications.map((notification) =>
      this.mapToNotificationParam(notification),
    );
  }

  private mapToNotificationParam(
    notification: Notification,
  ): NotificationParam {
    return {
      id: notification.id,
      userId: notification.userId,
      thumbnailUrl: notification.thumbnailUrl,
      type: notification.type,
      displayContent: notification.displayContent,
      createdAt: notification.createdAt,
    };
  }
}
