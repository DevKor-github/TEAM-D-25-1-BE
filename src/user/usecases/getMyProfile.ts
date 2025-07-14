import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repositories/user';
import { MyProfileResponseDto } from '../dtos/my-profile.response.dto';

@Injectable()
export class GetMyProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(userId: string): Promise<MyProfileResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cloudfrontUrl = this.configService.get<string>('s3.cloudfrontUrl');

    return MyProfileResponseDto.from(user, cloudfrontUrl);
  }
}
