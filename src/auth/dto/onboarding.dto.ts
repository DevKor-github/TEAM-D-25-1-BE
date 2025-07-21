import { ApiProperty } from '@nestjs/swagger';
import { Mbti, Tag } from '@prisma/client';
import { 
  IsString, 
  Length, 
  Matches,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMaxSize
} from 'class-validator';

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

  @IsOptional()
  @IsEnum(Mbti, { message: "올바른 MBTI형태가 아닙니다."})
  mbti?: Mbti

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3, { message: "태그는 최대 3개까지 입력할 수 있습니다." })
  @IsEnum(Tag, {
    each: true,
    message: "올바르지 않은 태그가 존재합니다."
  })
  tags?: Tag[]
}
