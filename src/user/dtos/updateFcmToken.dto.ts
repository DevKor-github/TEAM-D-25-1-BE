import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateFcmTokenDto {
  @ApiProperty({
    type: 'string',
    description: 'FCM 토큰값',
    example: 'fcmTokenURL',
  })
  @IsString()
  @IsOptional()
  fcmToken?: string;
}
