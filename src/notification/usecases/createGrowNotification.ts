import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repository';
import { CreateNotificationParam } from '../params';

export interface CreateGrowNotificationParam {
  userId: string;
  thumbnailUrl?: string;
  displayContent: string;
  growthType?: 'tree' | 'achievement' | 'milestone';
}

@Injectable()
export class CreateGrowNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(param: CreateGrowNotificationParam) {
    const notificationParam: CreateNotificationParam = {
      userId: param.userId,
      thumbnailUrl: param.thumbnailUrl,
      type: 'GROW',
      displayContent: param.displayContent,
    };

    return this.notificationRepository.create(notificationParam);
  }
}
