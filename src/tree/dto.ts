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
  // 물의 양 등 필요한 필드 추가 가능
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
  @IsInt({each: true})
  @Min(1, {each: true})
  tagIds: number[];
  
  @IsString()
  @MaxLength(50)
  review: string;

  @IsString()
  @MaxLength(300)
  description: string;
}
