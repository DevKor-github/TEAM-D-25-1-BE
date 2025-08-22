import { ApiProperty } from '@nestjs/swagger';
import { SocialProvider } from '@prisma/client';
import { UserParam } from '../params/user';

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  socialProvider: SocialProvider;

  @ApiProperty()
  isPrivate: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  profileImageUrl: string;

  @ApiProperty()
  treeCount: number;

  static from(
    user: UserParam,
    cloudfrontUrl: string,
    treeCount: number,
  ): ProfileResponseDto {
    return {
      id: user.id,
      treeCount,
      username: user.username,
      nickname: user.nickname,
      description: user.description,
      socialProvider: user.socialProvider,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      profileImageUrl: user.profileImageUrl
        ? `https://${cloudfrontUrl}${user.profileImageUrl}`
        : null,
    };
  }
}
