import { SocialProvider, Mbti, Tag } from '@prisma/client';
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

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsEnum(SocialProvider)
  @IsOptional()
  socialProvider?: SocialProvider;

  @IsString()
  @IsOptional()
  socialId?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsEnum(Mbti)
  @IsOptional()
  mbti?: Mbti;

  @IsEnum(Tag, { each: true })
  @IsOptional()
  tag?: Tag[];
}

export class UpdateFcmTokenParam {
  @IsString()
  @IsOptional()
  fcmToken?: string;
}

export class UpdateMbtiAndTagsParam {
  @IsEnum(Mbti)
  @IsOptional()
  mbti?: Mbti;

  @IsEnum(Tag, { each: true })
  @IsOptional()
  tags?: Tag[];
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

  @IsEnum(Tag, { each: true })
  @IsOptional()
  tag?: Tag[];

  @IsEnum(Mbti)
  @IsOptional()
  mbti?: Mbti;
}
