import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repository';
import { NotificationParam } from '../params';

export interface GetUserNotificationsParam {
  userId: string;
  page?: number;
  limit?: number;
}

export interface GetUserNotificationsResult {
  notifications: NotificationParam[];
  total: number;
}

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
