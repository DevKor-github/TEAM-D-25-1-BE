import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repositories/user';
import { TreeRepository } from '@/tree/repository';
import { ProfileResponseDto } from '../dtos/profile.response';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly treeRepository: TreeRepository,
  ) {}

  async execute(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cloudfrontUrl = this.configService.get<string>('s3.cloudfrontUrl');
    const treeCount = await this.treeRepository.getTreeCounts(userId);

    return ProfileResponseDto.from(user, cloudfrontUrl, treeCount);
  }
}
