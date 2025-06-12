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
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RestaurantResponse {
  @ApiProperty({
    description: '레스토랑 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Google Places API 식별자',
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
    example: '서울시 강남구 테헤란로 123',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: '위도',
    example: '37.5665',
  })
  @IsNumberString()
  @IsNotEmpty()
  latitude: string;

  @ApiProperty({
    description: '경도',
    example: '126.9780',
  })
  @IsNumberString()
  @IsNotEmpty()
  longitude: string;

  @ApiProperty({
    description: '생성일',
    example: '2024-03-20T00:00:00.000Z',
  })
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
  @ApiProperty({
    description: '레스토랑 목록',
    type: [RestaurantResponse],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RestaurantResponse)
  items: RestaurantResponse[];

  @ApiProperty({
    description: '전체 페이지 수',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  totalPages: number;
}

export class FollowingUserResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: 'bcccf5db-63b0-4bfb-a761-9328cba32e58',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: '사용자 이름',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  nickname?: string;

  @ApiProperty({
    description: '이메일 주소',
    example: 'john@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '소셜 로그인 제공자',
    example: 'google',
    required: false,
  })
  @IsString()
  socialProvider?: string;

  @ApiProperty({
    description: '소셜 로그인 ID',
    example: '123456789',
    required: false,
  })
  @IsString()
  socialId?: string;

  @ApiProperty({
    description: '프라이빗 계정 여부',
    example: false,
  })
  @IsBoolean()
  isPrivate: boolean;

  @ApiProperty({
    description: '계정 생성일',
    example: '2024-03-20T00:00:00.000Z',
  })
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  static from(user: any): FollowingUserResponse {
    const response = new FollowingUserResponse();
    response.id = user.id;
    response.username = user.username;
    response.nickname = user.nickname;
    response.email = user.email;
    response.socialProvider = user.socialProvider;
    response.socialId = user.socialId;
    response.isPrivate = user.isPrivate;
    response.createdAt = user.createdAt;
    return response;
  }
}

export class FollowingListResponse {
  @ApiProperty({
    description: '팔로잉 사용자 목록',
    type: [FollowingUserResponse],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FollowingUserResponse)
  items: FollowingUserResponse[];
}

export class FollowerUserResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: '사용자 이름',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  nickname?: string;

  @ApiProperty({
    description: '이메일 주소',
    example: 'john@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '소셜 로그인 제공자',
    example: 'google',
    required: false,
  })
  @IsString()
  socialProvider?: string;

  @ApiProperty({
    description: '소셜 로그인 ID',
    example: '123456789',
    required: false,
  })
  @IsString()
  socialId?: string;

  @ApiProperty({
    description: '프라이빗 계정 여부',
    example: false,
  })
  @IsBoolean()
  isPrivate: boolean;

  @ApiProperty({
    description: '계정 생성일',
    example: '2024-03-20T00:00:00.000Z',
  })
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  static from(user: any): FollowerUserResponse {
    const response = new FollowerUserResponse();
    response.id = user.id;
    response.username = user.username;
    response.nickname = user.nickname;
    response.email = user.email;
    response.socialProvider = user.socialProvider;
    response.socialId = user.socialId;
    response.isPrivate = user.isPrivate;
    response.createdAt = user.createdAt;
    return response;
  }
}

export class FollowerListResponse {
  @ApiProperty({
    description: '팔로워 사용자 목록',
    type: [FollowerUserResponse],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FollowerUserResponse)
  items: FollowerUserResponse[];
}
