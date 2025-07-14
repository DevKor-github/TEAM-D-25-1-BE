import { ApiProperty } from '@nestjs/swagger';
import { SocialProvider } from '@prisma/client';
import { UserParam } from '../params/user';

export class MyProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

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

  static from(user: UserParam, cloudfrontUrl: string): MyProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
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
