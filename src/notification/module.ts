import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { NotificationController } from './controller';
import { FCMService } from './infrastructure/fcm';
import { NotificationRepository } from './repository';
import { CreateWaterNotificationUseCase } from './usecases/createWaterNotification';
import { CreateFollowNotificationUseCase } from './usecases/createFollowNotification';
import { CreateGrowNotificationUseCase } from './usecases/createGrowNotification';
import { GetUserNotificationsUseCase } from './usecases/getUserNotifications';
import { UserRepository } from '@/user/repositories/user';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';
import { NotificationService } from './service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [
    FCMService,
    NotificationRepository,
    UserRepository,
    RestaurantRepository,
    CreateWaterNotificationUseCase,
    CreateFollowNotificationUseCase,
    CreateGrowNotificationUseCase,
    GetUserNotificationsUseCase,
    NotificationService,
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
