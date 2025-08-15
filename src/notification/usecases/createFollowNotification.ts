import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repository';
import { CreateNotificationParam } from '../params';

export interface CreateFollowNotificationParam {
  userId: string;
  followerId: string;
  followerName: string;
  thumbnailUrl?: string;
}

@Injectable()
export class CreateFollowNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(param: CreateFollowNotificationParam) {
    const displayContent = `${param.followerName}님이 회원님을 팔로우했습니다.`;

    const notificationParam: CreateNotificationParam = {
      userId: param.userId,
      thumbnailUrl: param.thumbnailUrl,
      type: 'FOLLOW',
      displayContent,
    };

    return this.notificationRepository.create(notificationParam);
  }
}
