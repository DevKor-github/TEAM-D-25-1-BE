import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '@prisma/client';
import {
  IsLatitude,
  IsLongitude,
  IsUUID,
  IsNumber,
  IsString,
  IsArray,
  IsInt,
  Min,
  MaxLength,
  Max,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class UpdateTreeDto {}

export class RemoveTreeDto {}

export class Coordinate {
  @IsLatitude()
  lat: string;

  @IsLongitude()
  lon: string;
}

export class RestaurantId {
  @IsUUID()
  restaurantId: string;
}

export class TreeIdDto {
  @IsUUID()
  treeId: string;
}

export class WaterTreeDto {
  @IsUUID()
  treeId: string;
}

export class PlantTreeDto {
  @ApiProperty({
    description: '나무 타입 / 0~4까지 숫자로 매핑',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(4)
  treeType: number;

  @ApiProperty({
    description: '식당 고유 ID',
    example: 'uuid-1234-5678',
  })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({
    description: '한 줄 리뷰 (말풍선에 뜨게 할 것 / 50자 이내)',
    example: '맛있어요',
  })
  @IsString()
  @MaxLength(50)
  review: string;

  // @ApiProperty({
  //   description: '상세평 (300자 이내)',
  //   example: '특이한 향이 입혀져있어요~',
  // })
  // @IsString()
  // @MaxLength(300)
  // description: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Tag, { each: true })
  @ApiProperty({
    description: '관련 태그 목록',
    example: [Tag.MEAT_LOVER, Tag.VALUE_SEEKER],
    enum: Tag,
    isArray: true,
    required: false,
  })
  tags?: Tag[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'images 엔드포인트에서 받은 이미지 URL',
    example: ['https://cloudfront-1234.com/sha256-hash.jpg'],
  })
  images: string[];
}

export class TreeDetailResponse {
  @ApiProperty({
    description: '나무 고유 ID (userId_restaurantId)',
    example: 'user-uuid-1234_restaurant-uuid-5678',
  })
  treeId: string;

  @ApiProperty({
    description: '식당 이름',
    example: '톤쇼우 부산대본점',
  })
  name: string;

  @ApiProperty({
    description: '식당 주소',
    example: '부산 금정구 금강로 247-10',
  })
  address: string;

  @ApiProperty({
    description: '위도',
    example: '35.230402',
  })
  latitude: string;

  @ApiProperty({
    description: '경도',
    example: '129.084294',
  })
  longitude: string;

  @ApiProperty({
    description: '트리 타입 ID (0~4)',
    example: 2,
  })
  treeType: number;

  @ApiProperty({
    description: '한 줄 리뷰',
    example: '맛있어요~',
  })
  review: string;

  // @ApiProperty({
  //   description: '추가 설명',
  //   example: '버크셔K 특로스시켜야함',
  // })
  // description: string;

  @ApiProperty({
    description: '태그 목록',
    example: ['MEAT_LOVER', 'CLASSIC_TASTE'],
    enum: Tag,
    isArray: true,
  })
  tags: Tag[];

  @ApiProperty({
    description: '생성일',
    example: '2025-06-17T12:34:56.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '업데이트일',
    example: '2025-06-18T08:22:10.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '추천한 유저들의 수',
    example: 0,
  })
  recommendationCount: number;

  @ApiProperty({
    description: 'CloudFrontURL로 조합된 이미지 링크의 배열',
    example: ['https://a1b2c3d4.cloudfront.net/review/sha-256-hash.jpg'],
  })
  images: string[];
}

export class TreeListResponse {
  @ApiProperty({
    description: '나무 목록',
    type: [TreeDetailResponse],
  })
  items: TreeDetailResponse[];

  static from(trees: TreeDetailResponse[]): TreeListResponse {
    return {
      items: trees,
    };
  }
}
