import { Injectable } from "@nestjs/common";
import { FollowerStatus } from "@prisma/client";
import { FollowerRepository } from "../repositories/follower";
import { CheckFollowingStatusDto } from "../dto";

@Injectable()
export class CheckFollowingStatusUseCase {
    
  constructor(private readonly followerRepository: FollowerRepository) {}

  async execute(userId: string, targetUserId: string): Promise<CheckFollowingStatusDto> {
    const follower = await this.followerRepository.getFollower({
      userId: targetUserId,
      followerId: userId,
    });

    return {
        hasRequestedFollow: follower ? true : false,
        followRequestStatus: follower?.status
    }
  }
}