import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../repository';
import { UserRepository } from '@/user/repositories/user';
import { FCMService } from '../infrastructure/fcm';
import {
  CreateNotificationParam,
  CreateWaterNotificationParam,
} from '../params';
import { stripHtmlTags } from '../libs/handleTag';
import { TREE_TYPES_MAP } from '@/tree/constants';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';

@Injectable()
export class CreateWaterNotificationUseCase {
  private readonly logger = new Logger(CreateWaterNotificationUseCase.name);

  constructor(
    private notificationRepository: NotificationRepository,
    private userRepository: UserRepository,
    private restaurantRepository: RestaurantRepository,
    private fcmService: FCMService,
  ) {}

  async execute(param: CreateWaterNotificationParam) {
    const user = await this.userRepository.findById(param.userId);
    if (!user) return;

    const restaurant = await this.restaurantRepository.findById(
      param.restaurantId,
    );
    if (!restaurant) return;

    const treeTypeName = TREE_TYPES_MAP[param.treeType];
    const displayContent = `<b>${user.nickname}</b>님이 ${param.restaurantId}의 <b>${treeTypeName}</b> 물주기를 했습니다.`;
    const deeplink = `groo://restaurant/${param.restaurantId}`;
    const notificationParam: CreateNotificationParam = {
      userId: user.id,
      thumbnailUrl: user.profileImageUrl,
      type: 'WATER',
      displayContent,
      deeplink,
    };

    // 알림 생성
    const notification =
      await this.notificationRepository.create(notificationParam);

    // FCM 메시지 전송 (비동기, 실패해도 useCase는 성공)
    this.sendFCMNotificationAsync(param.userId, displayContent, deeplink);

    return notification;
  }

  private sendFCMNotificationAsync(
    userId: string,
    displayContent: string,
    deeplink: string,
  ) {
    this.sendFCMNotification(userId, displayContent, deeplink).catch(
      (error) => {
        this.logger.error(
          `FCM 전송 실패 (WATER): ${error.message}`,
          error.stack,
        );
      },
    );
  }

  private async sendFCMNotification(
    userId: string,
    displayContent: string,
    deeplink: string,
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
        '누가 나무에 물을 줬어요',
        stripHtmlTags(displayContent),
        {
          type: 'WATER',
          userId,
          deeplink,
        },
      );

      await this.fcmService.sendToUser(user.fcmToken, message);
      this.logger.log(`FCM 메시지 전송 성공 (WATER): ${userId}`);
    } catch (error) {
      this.logger.error(
        `FCM 전송 중 오류 (WATER): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
