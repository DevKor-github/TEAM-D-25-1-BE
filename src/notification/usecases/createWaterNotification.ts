import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repository';
import { CreateNotificationParam } from '../params';

export interface CreateWaterNotificationParam {
  userId: string;
  thumbnailUrl?: string;
  displayContent: string;
}

@Injectable()
export class CreateWaterNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(param: CreateWaterNotificationParam) {
    const notificationParam: CreateNotificationParam = {
      userId: param.userId,
      thumbnailUrl: param.thumbnailUrl,
      type: 'WATER',
      displayContent: param.displayContent,
    };

    return this.notificationRepository.create(notificationParam);
  }
}
