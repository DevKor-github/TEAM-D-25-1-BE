import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEmail,
  Length,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: '닉네임',
    example: '맛집탐험가',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  nickname?: string;

  @ApiProperty({
    description: '자기소개',
    example: '맛있는 음식을 찾아다니는 여행자입니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({
    description: '비공개 계정 여부',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}

export class UpdateMbtiAndTagsDto {
  @ApiProperty({
    description: 'MBTI 타입',
    example: 'ENFP',
    required: false,
  })
  @IsOptional()
  @IsString()
  mbti?: string;

  @ApiProperty({
    description: '음식 태그 목록',
    example: ['DRINKER', 'SPICY_FOOD_LOVER', 'DESSERT_LOVER'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
