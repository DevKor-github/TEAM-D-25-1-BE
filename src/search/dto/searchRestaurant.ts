import { RestaurantEntity } from '@/restaurant/entity';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class SearchRestaurantResponse {
  @ApiProperty({
    description: '레스토랑 ID',
    example: 'restaurant123',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Google Places API의 place ID',
    example: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  })
  @IsString()
  @IsNotEmpty()
  placeId: string;

  @ApiProperty({
    description: '레스토랑 이름',
    example: '맛있는 식당',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '레스토랑 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  static from(restaurant: RestaurantEntity): SearchRestaurantResponse {
    return {
      id: restaurant.id,
      placeId: restaurant.placeId,
      name: restaurant.name,
      address: restaurant.address,
    };
  }
}

export class SearchRestaurantListResponse {
  @ApiProperty({
    description: '검색된 레스토랑 목록',
    type: [SearchRestaurantResponse],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SearchRestaurantResponse)
  items: SearchRestaurantResponse[];
}
