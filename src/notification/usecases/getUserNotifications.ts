import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repository';
import {
  GetUserNotificationsParam,
  GetUserNotificationsResult,
} from '../params';

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(
    param: GetUserNotificationsParam,
  ): Promise<GetUserNotificationsResult> {
    return this.notificationRepository.findByUserIdWithPagination(
      param.userId,
      param.page,
      param.limit,
    );
  }
}
