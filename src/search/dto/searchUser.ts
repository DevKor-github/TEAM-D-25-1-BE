import { UserParam } from '@/user/params/user';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchUserResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: '사용자명',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '닉네임',
    example: '육식주의자',
    required: false,
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
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
  @ApiProperty({
    description: '검색된 사용자 목록',
    type: [SearchUserResponse],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SearchUserResponse)
  items: SearchUserResponse[];
}
