import { RestaurantEntity } from '@/restaurant/entity';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export default class SearchRestaurantResponse {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  placeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

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
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SearchRestaurantResponse)
  items: SearchRestaurantResponse[];
}
