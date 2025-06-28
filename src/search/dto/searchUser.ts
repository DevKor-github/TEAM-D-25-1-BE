import { UserParam } from '@/user/params/user';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SearchUserResponse {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  static from(user: UserParam): SearchUserResponse {
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
    };
  }
}

export class SearchUserListResponse {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SearchUserResponse)
  items: SearchUserResponse[];
}
