import { Module } from '@nestjs/common';
import { TreeController } from './controller';
import { TreeService } from './service';
import { TreeRepository } from './repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '../auth/module';
import { UserRepository } from '@/user/repositories/user';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { NotificationRepository } from '@/notification/repository';
import { FCMService } from '@/notification/infrastructure/fcm';
import { CreateWaterNotificationUseCase } from '@/notification/usecases/createWaterNotification';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';

@Module({
  imports: [AuthModule],
  controllers: [TreeController],
  providers: [
    TreeService,
    TreeRepository,
    PrismaService,
    UserRepository,
    AccessTokenGuard,
    NotificationRepository,
    FCMService,
    CreateWaterNotificationUseCase,
    RestaurantRepository,
  ],
  exports: [TreeRepository],
})
export class TreeModule {}
