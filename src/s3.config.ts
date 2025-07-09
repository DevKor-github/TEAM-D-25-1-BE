import { IsString, IsNotEmpty } from 'class-validator';

export class S3Config {
  @IsString()
  @IsNotEmpty()
  accessKey: string;

  @IsString()
  @IsNotEmpty()
  secretKey: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsNotEmpty()
  bucket: string;
}
