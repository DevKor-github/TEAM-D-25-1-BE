import {
  IsBoolean,
  IsDate,
  IsEmail,
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

  @IsString()
  @IsOptional()
  socialProvider?: string;

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
  socialProvider?: string;

  @IsString()
  @IsOptional()
  socialId?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class UserParam {
  @IsString()
  id: string;

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

  @IsString()
  @IsOptional()
  socialProvider?: string;

  @IsString()
  @IsOptional()
  socialId?: string;

  @IsBoolean()
  isPrivate: boolean;

  @IsDate()
  createdAt: Date;
}
