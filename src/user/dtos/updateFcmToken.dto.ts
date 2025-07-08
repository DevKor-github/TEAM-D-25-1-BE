import { IsString, IsOptional } from 'class-validator';

export class UpdateFcmTokenDto {
  @IsString()
  @IsOptional()
  fcmToken?: string;
}
