import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthUserResponse } from './authUser.dto';

export class RegisterRequest {
  @ApiProperty({
    description: '이메일',
    example: 'test@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: '닉네임',
    example: 'nickname123',
  })
  @IsNotEmpty()
  @IsString()
  nickname: string;
}

// { customToken: string; user: any }
export class RegisterResponse {
  @ApiProperty({
    description: '토큰',
    example: 'token123',
  })
  customToken: string;

  @ApiProperty({
    description: '사용자',
    type: AuthUserResponse,
  })
  user: AuthUserResponse;
}
