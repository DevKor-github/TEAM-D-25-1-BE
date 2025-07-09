import { Module } from '@nestjs/common';
import { FCMService } from './infrastructure/fcm';

@Module({
  imports: [],
  controllers: [],
  providers: [FCMService],
  exports: [FCMService],
})
export class NotificationModule {}
