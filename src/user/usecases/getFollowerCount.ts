import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { FollowerStatus } from "@prisma/client";

@Injectable()
export class GetFollowerCountUsecase {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async execute(userId: string): Promise<number> {
        return await this.prisma.follower.count({
            where: {
                followerId: userId,
                status: FollowerStatus.ACCEPTED,
            },
        });
    }
}