import { Restaurant } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RestaurantResponse {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  placeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumberString()
  @IsNotEmpty()
  latitude: string;

  @IsNumberString()
  @IsNotEmpty()
  longitude: string;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  static from(restaurant: Restaurant): RestaurantResponse {
    const response = new RestaurantResponse();
    response.id = restaurant.id;
    response.placeId = restaurant.placeId;
    response.name = restaurant.name;
    response.address = restaurant.address;
    response.latitude = restaurant.latitude.toString();
    response.longitude = restaurant.longitude.toString();
    response.createdAt = restaurant.createdAt;
    return response;
  }
}

export class RestaurantListResponse {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RestaurantResponse)
  items: RestaurantResponse[];

  @IsNumber()
  @IsNotEmpty()
  totalPages: number;
}
