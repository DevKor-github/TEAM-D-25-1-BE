import { ApiProperty } from '@nestjs/swagger';
import { SocialProvider } from '@prisma/client';
import { UserParam } from '../params/user';

export class MyProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickname: string;

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

  static from(user: UserParam, cloudfrontUrl: string, treeCount: number): MyProfileResponseDto {
    return {
      id: user.id,
      description: user.description,
      email: user.email,
      treeCount,
      username: user.username,
      nickname: user.nickname,
      socialProvider: user.socialProvider,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      profileImageUrl: user.profileImageUrl
        ? `https://${cloudfrontUrl}${user.profileImageUrl}`
        : null,
    };
  }
}
