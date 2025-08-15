import { NotificationType } from '@prisma/client';

export interface CreateNotificationParam {
  userId: string;
  thumbnailUrl?: string;
  type: NotificationType;
  displayContent: string;
}

export interface UpdateNotificationParam {
  thumbnailUrl?: string;
  type?: NotificationType;
  displayContent?: string;
}

export interface NotificationParam {
  id: string;
  userId: string;
  thumbnailUrl?: string;
  type: NotificationType;
  displayContent: string;
  createdAt: Date;
}
