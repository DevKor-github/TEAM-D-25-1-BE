import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { UserParam } from '../params/user';
import { Type } from 'class-transformer';

export class UserResponse {
  id: string;
  email: string;
  username: string;
  nickname?: string;
  isPrivate: boolean;
  createdAt: Date;
  socialProvider?: string;
  socialId?: string;
  profileImageUrl?: string;

  static from(user: UserParam): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      nickname: user.nickname,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      socialProvider: user.socialProvider,
      profileImageUrl: user.profileImageUrl,
    };
  }
}

export class FollowingUserResponse {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  profileImageUrl?: string;

  @IsString()
  nickname?: string;

  // TODO: Check Client store User as Same Schema as UserResponse
  static from(user: UserParam): FollowingUserResponse {
    return {
      id: user.id,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
      nickname: user.nickname,
    };
  }
}

export class FollowingListResponse {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FollowingUserResponse)
  items: FollowingUserResponse[];
}
