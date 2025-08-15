import { SocialProvider, Tag } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserParam {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(SocialProvider)
  @IsOptional()
  socialProvider?: SocialProvider;

  @IsString()
  @IsOptional()
  socialId?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsString()
  @IsOptional()
  firebaseUid?: string;
}

export class UpdateUserParam {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(SocialProvider)
  @IsOptional()
  socialProvider?: SocialProvider;

  @IsString()
  @IsOptional()
  socialId?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class UpdateFcmTokenParam {
  @IsString()
  @IsOptional()
  fcmToken?: string;
}

export class UserParam {
  @IsString()
  id: string;

  @IsString()
  firebaseUid: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(SocialProvider)
  @IsOptional()
  socialProvider?: SocialProvider;

  @IsString()
  @IsOptional()
  socialId?: string;

  @IsBoolean()
  isPrivate: boolean;

  @IsDate()
  createdAt: Date;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsString()
  @IsOptional()
  fcmToken?: string;

  @IsDate()
  @IsOptional()
  fcmTokenUpdatedAt?: Date;

  @IsDate()
  @IsOptional()
  lastWatered?: Date;

  @IsString()
  @IsOptional()
  mbti?: string;

  @IsArray()
  @IsOptional()
  tags?: Tag[];
}
