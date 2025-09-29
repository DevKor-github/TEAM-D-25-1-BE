import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../repository';
import { UserRepository } from '@/user/repositories/user';
import { FCMService } from '../infrastructure/fcm';
import {
  CreateNotificationParam,
  CreateGrowNotificationParam,
} from '../params';
import { TREE_TYPES_MAP } from '@/tree/constants';
import { stripHtmlTags } from '../libs/handleTag';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';

@Injectable()
export class CreateGrowNotificationUseCase {
  private readonly logger = new Logger(CreateGrowNotificationUseCase.name);

  constructor(
    private notificationRepository: NotificationRepository,
    private userRepository: UserRepository,
    private restaurantRepository: RestaurantRepository,
    private fcmService: FCMService,
  ) {}

  async execute(param: CreateGrowNotificationParam) {
    const restaurant = await this.restaurantRepository.findById(
      param.restaurantId,
    );
    if (!restaurant) return;

    const treeType = TREE_TYPES_MAP[param.treeType];
    const treeTypeName = treeType?.name ?? '나무';
    const treeLevelIndex = Math.max(1, Math.min(param.treeLevel, treeType?.levels?.length ?? 1)) - 1;
    const treeThumbnailUrl = treeType?.levels?.[treeLevelIndex]?.imageUrl;
    const displayContent = `${restaurant.name ?? '레스토랑'}의 <b>${treeTypeName}</b> 나무가 ${param.treeLevel}단계가 되었어요.`;
    const deeplink = `groo://restaurant/${param.restaurantId}`;
    const notificationParam: CreateNotificationParam = {
      userId: param.userId,
      thumbnailUrl: treeThumbnailUrl,
      type: 'GROW',
      displayContent: displayContent,
      deeplink,
    };

    // 알림 생성
    const notification =
      await this.notificationRepository.create(notificationParam);

    // FCM 메시지 전송 (비동기, 실패해도 useCase는 성공)
    this.sendFCMNotificationAsync(param.userId, stripHtmlTags(displayContent), {
      type: 'GROW',
      userId: param.userId,
      restaurantId: param.restaurantId,
      treeType: String(param.treeType),
      treeLevel: String(param.treeLevel),
      deeplink,
    });
    return notification;
  }

  private sendFCMNotificationAsync(
    userId: string,
    body: string,
    data: Record<string, string>,
  ) {
    this.sendFCMNotification(userId, body, data).catch((error) => {
      this.logger.error(
        `FCM 전송 실패 (GROW): ${error.message}`,
        error.stack,
      );
    });
  }

  private async sendFCMNotification(
    userId: string,
    body: string,
    data: Record<string, string>,
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
        '나무가 성장했어요',
        body,
        data,
      );

      await this.fcmService.sendToUser(user.fcmToken, message);
      this.logger.log(`FCM 메시지 전송 성공 (GROW): ${userId}`);
    } catch (error) {
      this.logger.error(
        `FCM 전송 중 오류 (GROW): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
