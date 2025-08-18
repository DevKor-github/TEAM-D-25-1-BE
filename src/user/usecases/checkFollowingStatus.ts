import { Injectable } from "@nestjs/common";
import { FollowerStatus } from "@prisma/client";
import { FollowerRepository } from "../repositories/follower";

@Injectable()
export class CheckFollowingStatusUseCase {
    
  constructor(private readonly followerRepository: FollowerRepository) {}

  async execute(userId: string, targetUserId: string): Promise<{ requestStatus: FollowerStatus, hasRequestedFollow: boolean }> {
    const follower = await this.followerRepository.getFollower({
      userId: targetUserId,
      followerId: userId,
    });

    return {
        hasRequestedFollow: follower ? true : false,
        requestStatus: follower?.status
    }
  }
}