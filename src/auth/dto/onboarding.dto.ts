import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class OnboardingInfoRequest {
  @ApiProperty({
    description: '사용자명',
    example: 'user123',
    minLength: 1,
    maxLength: 30,
    pattern: '^(?!.*\\.\\.)(?!.*\\.$)[a-zA-Z0-9._]+$',
    required: true,
  })
  @IsString()
  @Length(1, 30, { message: '사용자명은 1자 이상 30자 이하여야 합니다.' })
  @Matches(/^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]+$/, {
    message:
      '사용자명은 영문자, 숫자, 밑줄(_) 및 마침표(.)만 사용할 수 있으며, 마침표로 끝나거나 연속해서 사용할 수 없습니다.',
  })
  username: string;
  // TODO: 온보딩에 필요한 다른 필드 추가
}
