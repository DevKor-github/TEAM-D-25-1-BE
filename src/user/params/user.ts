import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserParam {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '사용자 아이디',
    example: 'username123',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '닉네임',
    required: false,
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: '소셜 로그인 제공자',
    example: 'google',
    required: false,
  })
  @IsString()
  @IsOptional()
  socialProvider?: string;

  @ApiProperty({
    description: '소셜 로그인 ID',
    example: '123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  socialId?: string;

  @ApiProperty({
    description: '프라이빗 계정 여부',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class UpdateUserParam {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: '사용자 아이디',
    example: 'username123',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '닉네임',
    required: false,
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: '소셜 로그인 제공자',
    example: 'google',
    required: false,
  })
  @IsString()
  @IsOptional()
  socialProvider?: string;

  @ApiProperty({
    description: '소셜 로그인 ID',
    example: '123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  socialId?: string;

  @ApiProperty({
    description: '프라이빗 계정 여부',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class UserParam {
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '사용자 아이디',
    example: 'username123',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '닉네임',
    required: false,
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: '소셜 로그인 제공자',
    example: 'google',
    required: false,
  })
  @IsString()
  @IsOptional()
  socialProvider?: string;

  @ApiProperty({
    description: '소셜 로그인 ID',
    example: '123456789',
    required: false,
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
    description: '계정 생성일',
    example: '2024-03-20T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;
  profileImageUrl?: string;
}
