import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum SocialProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
}

export class SocialLoginDto {
  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @IsString()
  @IsNotEmpty()
  providerUserId: string;
}
