import { ApiProperty } from '@nestjs/swagger';
import { Mbti } from '@prisma/client';

export interface Tag {
  key: string;
  value: string;
}

export interface TreeLevel {
  level: number;
  imageUrl: string
}

export interface TreeType {
  key: number;
  name: string;
  levels: TreeLevel[];
}

export interface AppSettings {
  maintenance: boolean;
  minimalVersion: string;
  foodTags: Tag[];
  styleTags: Tag[];
  tags: Tag[];
  mbti: Mbti[];
  treeType: TreeType[]
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
        key: { type: 'string', example: 'STEAK' },
        value: { type: 'string', example: '스테이크' },
      },
    },
    example: [
      { key: 'STEAK', value: '스테이크' },
      { key: 'PASTA', value: '파스타' },
      { key: 'PIZZA', value: '피자' },
    ],
    required: false,
  })
  foodTags?: Tag[];

  @ApiProperty({
    description: '스타일 태그 목록',
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
  styleTags?: Tag[];

  @ApiProperty({
    description: '전체 태그 목록 (음식 + 스타일)',
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
        { key: 'STEAK', value: '스테이크' },
    ],
    required: false,
  })  
  tags?: Tag[];

  @ApiProperty({
    description: 'MBTI Enum 목록',
    type: 'array',
    items: {
      type: 'string',
      enum: [
        'ESTJ', 'INFP', 'ISFP', 'INTJ', 'ENTJ', 'ISFJ', 'ESFP', 'ISTP',
        'INFJ', 'ENTP', 'ISTJ', 'ESTP', 'ENFJ', 'ESFJ', 'ENFP', 'INTP'
      ],
    },
    example: [
        'ESTJ', 'INFP', 'ISFP', 'INTJ', 'ENTJ', 'ISFJ', 'ESFP', 'ISTP',
        'INFJ', 'ENTP', 'ISTJ', 'ESTP', 'ENFJ', 'ESFJ', 'ENFP', 'INTP'
      ],
    required: false,
  })
  mbti?: Mbti[];

  @ApiProperty({
    description: '나무 타입 목록 (레벨별 이미지 포함)',
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        key: { type: 'number', example: 0 },
        name: { type: 'string', example: '참나무' },
        levels: {
          type: 'array',
          description: '레벨 1, 2, 3에 해당하는 이미지 URL 배열',
          items: {
            type: 'object',
            properties: {
              level: { type: 'number', example: 1, description: '나무 레벨 (1~3)' },
              imageUrl: { type: 'string', example: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chamnamu_1.png' },
            },
          },
        },
      },
    },
    example: [
      {
        key: 0,
        name: '참나무',
        levels: [
          { level: 1, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chamnamu_1.png' },
          { level: 2, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chamnamu_2.png' },
          { level: 3, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chamnamu_3.png' },
        ],
      },
      {
        key: 1,
        name: '침엽수',
        levels: [
          { level: 1, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chimyeopsu_1.png' },
          { level: 2, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chimyeopsu_1.png' },
          { level: 3, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chimyeopsu_1.png' },
        ],
      },
    ],
  })
  treeType?: TreeType[];
}

export class UpdateSettingsResponse {
  @ApiProperty({
    description: '설정 업데이트 성공 메시지',
    example: 'App settings updated successfully',
  })
  message: string;
}
