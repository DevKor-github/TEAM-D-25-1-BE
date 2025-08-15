import { NotificationType } from '@prisma/client';

export interface CreateNotificationParam {
  userId: string;
  thumbnailUrl?: string;
  type: NotificationType;
  displayContent: string;
  deeplink?: string;
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

// Create Water Notification
export interface CreateWaterNotificationParam {
  userId: string;
  treeType: number;
  restaurantId: string;
}

// Create Follow Notification
export interface CreateFollowNotificationParam {
  followerId: string;
  userId: string;
}

// Create Grow Notification
export interface CreateGrowNotificationParam {
  userId: string;
  treeType: number;
  treeLevel: number;
  restaurantId: string;
}

// Get User Notifications
export interface GetUserNotificationsParam {
  userId: string;
  page?: number;
  limit?: number;
}

export interface GetUserNotificationsResult {
  notifications: NotificationParam[];
  total: number;
}
