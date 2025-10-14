import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FCMService } from './infrastructure/fcm';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmService: FCMService,
  ) {}

  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken, fcmTokenUpdatedAt: new Date() },
    });

    const message = this.fcmService.createNotificationMessage(
      'D-CAFFEIN',
      '푸시 알림이 성공적으로 등록되었습니다.',
    );
    await this.fcmService.sendToUser(fcmToken, message);
  }
}
