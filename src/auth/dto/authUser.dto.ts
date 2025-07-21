import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '사용자명',
    example: 'johndoe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: '닉네임',
    required: false,
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: '소셜 제공자',
    required: false,
    example: 'KAKAO',
    enum: ['KAKAO', 'GOOGLE', 'APPLE'],
  })
  @IsString()
  @IsOptional()
  socialProvider?: string;

  @ApiProperty({
    description: '소셜 ID',
    required: false,
    example: '123456789',
  })
  @IsString()
  @IsOptional()
  socialId?: string;

  @ApiProperty({
    description: '프라이빗 계정 여부',
    example: false,
  })
  @IsBoolean()
  isPrivate: boolean;

  @ApiProperty({
    description: '계정 상태',
    example: 'ACTIVE',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Firebase UID',
    required: false,
    example: 'firebase-uid-123456',
  })
  @IsString()
  @IsOptional()
  firebaseUid?: string;

  @ApiProperty({
    description: '온보딩 완료 여부',
    example: true,
  })
  @IsBoolean()
  isOnboarded: boolean;

  @ApiProperty({
    description: '프로필 이미지 URL',
    required: false,
    example: 'https://example.com/profile.jpg',
  })
  @IsString()
  @IsOptional()
  profileImageUrl?: string;
}

export class FirebaseLoginDto {
  @ApiProperty({
    description: 'Firebase Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
  })
  @IsString()
  firebaseAccessToken: string;

  @ApiProperty({
    description: '소셜 제공자',
    example: 'KAKAO',
    enum: ['KAKAO', 'GOOGLE', 'APPLE'],
  })
  @IsString()
  @IsOptional()
  socialProvider?: string;
}

export class FirebaseLoginResponseDto {
  @ApiProperty({
    description: '커스텀 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({ description: '유저 정보', type: AuthUserResponse })
  user: AuthUserResponse;
}
