import { ApiProperty } from '@nestjs/swagger';

export interface FoodTag {
  key: string;
  value: string;
}

export interface AppSettings {
  maintenance: boolean;
  minimalVersion: string;
  foodTags: FoodTag[];
}

export class GetSettingsResponse {
  @ApiProperty({
    description: '앱 설정 정보',
    type: 'object',
    properties: {
      maintenance: { type: 'boolean', example: false },
      minimalVersion: { type: 'string', example: '1.0.0' },
      foodTags: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', example: 'DRINKER' },
            value: { type: 'string', example: '애주가' },
          },
        },
        example: [
          { key: 'DRINKER', value: '애주가' },
          { key: 'VEGAN_OR_VEGETARIAN', value: '비건/채식' },
          { key: 'SPICY_FOOD_LOVER', value: '맵부심' },
        ],
      },
    },
  })
  settings: AppSettings;
}

export class UpdateSettingsRequest {
  @ApiProperty({
    description: '점검 모드 설정',
    example: false,
    required: false,
  })
  maintenance?: boolean;

  @ApiProperty({
    description: '최소 지원 버전',
    example: '1.0.0',
    required: false,
  })
  minimalVersion?: string;

  @ApiProperty({
    description: '음식 태그 목록',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'DRINKER' },
        value: { type: 'string', example: '애주가' },
      },
    },
    example: [
      { key: 'DRINKER', value: '애주가' },
      { key: 'VEGAN_OR_VEGETARIAN', value: '비건/채식' },
      { key: 'SPICY_FOOD_LOVER', value: '맵부심' },
    ],
    required: false,
  })
  foodTags?: FoodTag[];
}

export class UpdateSettingsResponse {
  @ApiProperty({
    description: '설정 업데이트 성공 메시지',
    example: 'App settings updated successfully',
  })
  message: string;
}
