import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class UpdateProfileImageDto {
  @ApiProperty({
    type: 'string',
    description: 'S3에 업로드된 프로필 이미지 URL',
    example:
      'https://s3.ap-northeast-2.amazonaws.com/m-efil/images/profile/...',
  })
  @IsString()
  @IsUrl()
  profileImageUrl: string;
}
