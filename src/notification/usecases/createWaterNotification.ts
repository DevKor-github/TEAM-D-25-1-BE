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
import { UserParam } from '@/user/params/user';

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
    const recipient = await this.userRepository.findById(param.userId);
    if (!recipient) return;

    const actor = await this.userRepository.findById(param.actorId);
    if (!actor) return;

    const restaurant = await this.restaurantRepository.findById(
      param.restaurantId,
    );
    if (!restaurant) return;

    const treeType = TREE_TYPES_MAP[param.treeType];
    const treeTypeName = treeType?.name ?? '나무';
    const actorNickname = actor.nickname ?? '누군가';
    const displayContent = `<b>${actorNickname}</b>님이 ${restaurant.name}의 <b>${treeTypeName}</b> 나무에 물을 줬어요.`;
    const deeplink = `groo://restaurant/${param.restaurantId}`;
    const notificationParam: CreateNotificationParam = {
      userId: recipient.id,
      thumbnailUrl: actor.profileImageUrl ?? '',
      type: 'WATER',
      displayContent,
      deeplink,
    };

    // 알림 생성
    const notification =
      await this.notificationRepository.create(notificationParam);

    // FCM 메시지 전송 (비동기, 실패해도 useCase는 성공)
    this.sendFCMNotificationAsync(recipient, stripHtmlTags(displayContent), {
      type: 'WATER',
      userId: recipient.id,
      actorId: param.actorId,
      actorNickname,
      restaurantId: param.restaurantId,
      treeType: String(param.treeType),
      deeplink,
    });

    return notification;
  }

  private sendFCMNotificationAsync(
    recipient: UserParam,
    body: string,
    data: Record<string, string>,
  ) {
    this.sendFCMNotification(recipient, body, data).catch((error) => {
      this.logger.error(`FCM 전송 실패 (WATER): ${error.message}`, error.stack);
    });
  }

  private async sendFCMNotification(
    recipient: UserParam,
    body: string,
    data: Record<string, string>,
  ) {
    try {
      if (!recipient?.fcmToken) {
        this.logger.log(`FCM 토큰이 없음: ${recipient?.id}`);
        return;
      }

      // FCM 메시지 생성 및 전송
      const message = this.fcmService.createNotificationMessage(
        '누가 나무에 물을 줬어요',
        body,
        data,
      );

      await this.fcmService.sendToUser(recipient.fcmToken, message);
      this.logger.log(`FCM 메시지 전송 성공 (WATER): ${recipient.id}`);
    } catch (error) {
      this.logger.error(
        `FCM 전송 중 오류 (WATER): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
