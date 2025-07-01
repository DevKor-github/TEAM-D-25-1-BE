import { ApiProperty } from '@nestjs/swagger';
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
} from 'class-validator';

export class UpdateTreeDto {}

export class CreateTreeDto {}

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
  @IsNumber()
  @Min(0)
  @Max(4)
  // 0 ~ 4사이 정수로? (트리 타입 5개)
  treeTypeId: number;

  @IsUUID()
  restaurantId: string;

  // TODO: 데코레이터 추가해서 태그 범위 및 중복 검사
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds: number[];

  @IsString()
  @MaxLength(50)
  review: string;

  @IsString()
  @MaxLength(300)
  description: string;
}

export class TreeDetailResponse {
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
    description: '리뷰 텍스트',
    example: '맛있어요~',
  })
  review: string;

  @ApiProperty({
    description: '추가 설명',
    example: '버크셔K 특로스시켜야함',
  })
  description: string;

  // Fixme: 태그 수정하기
  @ApiProperty({
    description: '태그 ID 목록',
    example: [1, 3, 5],
  })
  tagIds: number[];

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
    description: '추천한 유저들',
    example: 3,
  })
  recommendedUsers: string[];
}

export class TreeListResponse {
  @ApiProperty({
    description: '나무 목록',
    type: [TreeDetailResponse],
  })
  items: TreeDetailResponse[];
}
