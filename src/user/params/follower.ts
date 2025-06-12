import { FollowerStatus } from '@prisma/client';

export interface CreateFollowerParams {
  userId: string;
  followerId: string;
  status?: FollowerStatus;
}

export interface UpdateFollowerParams {
  status: FollowerStatus;
}

export interface GetFollowerParams {
  userId: string;
  followerId: string;
}

export interface GetFollowersListParams {
  userId: string;
  status?: FollowerStatus;
  page?: number;
  perPage?: number;
}

export interface GetFollowingListParams {
  userId: string;
  status?: FollowerStatus;
  page?: number;
  perPage?: number;
}
