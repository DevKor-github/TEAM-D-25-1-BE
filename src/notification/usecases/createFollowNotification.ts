import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../repository';
import { UserRepository } from '@/user/repositories/user';
import { FCMService } from '../infrastructure/fcm';
import {
  CreateNotificationParam,
  CreateFollowNotificationParam,
} from '../params';
import { stripHtmlTags } from '../libs/handleTag';

@Injectable()
export class CreateFollowNotificationUseCase {
  private readonly logger = new Logger(CreateFollowNotificationUseCase.name);

  constructor(
    private notificationRepository: NotificationRepository,
    private userRepository: UserRepository,
    private fcmService: FCMService,
  ) {}

  async execute(param: CreateFollowNotificationParam) {
    const follower = await this.userRepository.findById(param.followerId);
    if (!follower) return;

    const displayContent = `<b>${follower.nickname}</b>님이 회원님을 팔로우했습니다.`;
    const deepLink = `groo://profile/${follower.id}`;

    const notificationParam: CreateNotificationParam = {
      userId: param.userId,
      thumbnailUrl: follower.profileImageUrl,
      type: 'FOLLOW',
      displayContent,
      deeplink: deepLink,
    };

    // 알림 생성
    const notification =
      await this.notificationRepository.create(notificationParam);

    // FCM 메시지 전송 (비동기, 실패해도 useCase는 성공)
    this.sendFCMNotificationAsync(
      param.userId,
      displayContent,
      param.followerId,
    );

    return notification;
  }

  private sendFCMNotificationAsync(
    userId: string,
    displayContent: string,
    followerId: string,
  ) {
    this.sendFCMNotification(userId, displayContent, followerId).catch(
      (error) => {
        this.logger.error(
          `FCM 전송 실패 (FOLLOW): ${error.message}`,
          error.stack,
        );
      },
    );
  }

  private async sendFCMNotification(
    userId: string,
    displayContent: string,
    followerId: string,
  ) {
    try {
      // 사용자 FCM 토큰 조회
      const user = await this.userRepository.findById(userId);
      if (!user?.fcmToken) {
        this.logger.log(`FCM 토큰이 없음: ${userId}`);
        return;
      }

      // FCM 메시지 생성 및 전송
      const message = this.fcmService.createNotificationMessage(
        '새로운 팔로워',
        stripHtmlTags(displayContent),
        {
          type: 'FOLLOW',
          userId,
          followerId,
        },
      );

      await this.fcmService.sendToUser(user.fcmToken, message);
      this.logger.log(`FCM 메시지 전송 성공 (FOLLOW): ${userId}`);
    } catch (error) {
      this.logger.error(
        `FCM 전송 중 오류 (FOLLOW): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
