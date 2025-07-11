import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UploadImageResponseDto {
  @ApiProperty({
    description: '업로드된 이미지의 URL',
    example:
      'https://s3.ap-northeast-2.amazonaws.com/bucket-name/folder/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}
