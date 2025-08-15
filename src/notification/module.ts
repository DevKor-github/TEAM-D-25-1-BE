import { Module } from '@nestjs/common';
import { FCMService } from './infrastructure/fcm';
import { NotificationRepository } from './repository';
import { CreateWaterNotificationUseCase } from './usecases/createWaterNotification';
import { CreateFollowNotificationUseCase } from './usecases/createFollowNotification';
import { CreateGrowNotificationUseCase } from './usecases/createGrowNotification';
import { GetUserNotificationsUseCase } from './usecases/getUserNotifications';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FCMService,
    NotificationRepository,
    CreateWaterNotificationUseCase,
    CreateFollowNotificationUseCase,
    CreateGrowNotificationUseCase,
    GetUserNotificationsUseCase,
  ],
  exports: [
    FCMService,
    NotificationRepository,
    CreateWaterNotificationUseCase,
    CreateFollowNotificationUseCase,
    CreateGrowNotificationUseCase,
    GetUserNotificationsUseCase,
  ],
})
export class NotificationModule {}
