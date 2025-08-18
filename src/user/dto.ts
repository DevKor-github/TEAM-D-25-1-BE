import {
  Restaurant,
  FollowerStatus,
  Tag,
  $Enums,
  SavedRestaurant,
} from '@prisma/client';
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
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RestaurantEntity } from '@/restaurant/entity';

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

  static fromEntity(restaurant: RestaurantEntity): RestaurantResponse {
    return {
      id: restaurant.id,
      placeId: restaurant.placeId,
      name: restaurant.name,
      address: restaurant.address,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      createdAt: restaurant.createdAt,
    };
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

export class HandleFollowRequest {
  @ApiProperty({
    description: '수락 여부',
    enum: FollowerStatus,
  })
  @IsEnum(FollowerStatus)
  status: FollowerStatus;
}

export class FollowerResponse {
  @ApiProperty({
    description: '팔로우 받은 사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '팔로우 요청한 사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  followerId: string;

  @ApiProperty({
    description: '팔로우 상태',
    enum: FollowerStatus,
  })
  @IsEnum(FollowerStatus)
  status: FollowerStatus;

  @ApiProperty({
    description: '팔로우 생성일',
    example: '2024-03-20T00:00:00.000Z',
  })
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}

export class MypageTreeResponse {
  @ApiProperty({
    description: '트리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  treeId: string;

  @ApiProperty({
    description: '식당 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    description: '식당 이름',
    example: '맛있는 식당',
  })
  @IsString()
  @IsNotEmpty()
  restaurantName: string;

  @ApiProperty({
    description: '나무 높이',
    example: 38,
  })
  @IsNumber()
  @IsNotEmpty()
  recommendationCount: number;

  @ApiProperty({
    description: '트리 위치(구까지만)',
    example: '서울시 강남구',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: '사용자가 보유한 전체 나무 개수에 따른 종합 요약 메시지',
    example: '뒷산이 부럽지 않을 만큼 풍성해졌어요',
  })
  @IsString()
  @IsNotEmpty()
  recapMessage: string;

  @ApiProperty({
    description: '사용자가 보유한 전체 트리 개수에 따른 종합 요약 이미지 URL',
    example: 'https://example.com/images/level_2.png',
  })
  @IsString()
  @IsNotEmpty()
  recapImageUrl: string | null;

  constructor(savedRestaurant: SavedRestaurant & { restaurant: Restaurant }) {
    this.restaurantId = savedRestaurant.restaurant.id;
    this.restaurantName = savedRestaurant.restaurant.name;
    this.recommendationCount = savedRestaurant.recommendedByUsers.length;
    this.location = savedRestaurant.restaurant.address;
  }
}

export class CheckFollowingStatusDto {
  @ApiProperty({
    description: '팔로우 신청이 있는지 여부를 나타냅니다.',
    example: true,
  })
  hasRequestedFollow: boolean;

  @ApiProperty({
    description: '팔로우 신청의 상태를 나타냅니다.',
    enum: FollowerStatus,
    example: FollowerStatus.PENDING,
  })
  followRequestStatus: FollowerStatus;
}

export class MypageResponse {
  @ApiProperty({
    description: '유저 고유 ID',
    example: 'user-uuid-1234',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '자기소개',
    example: '맛있는 음식을 찾아다니는 여행자입니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

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
  })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({
    description: '팔로워 수',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  followerCount: number;

  @ApiProperty({
    description: '팔로잉 수',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  followingCount: number;

  @ApiProperty({
    description: '내가 심은 나무 수',
    example: 30,
  })
  @IsNumber()
  @IsNotEmpty()
  treeCount: number;

  @ApiProperty({
    description: '프로필 이미지',
    example: 'https://example.com/profile.jpg',
  })
  @IsString()
  @IsNotEmpty()
  profileImage: string;

  @ApiProperty({
    description: '태그 목록',
    enum: [Tag],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  tags: Tag[];

  @ApiProperty({
    description: 'MBTI',
    example: 'ENFP',
  })
  @IsString()
  @IsOptional()
  mbti?: string;

  @ApiProperty({
    description: '전체 트리 개수에 따른 종합 요약 메시지',
    example: '울창한 숲을 통째로 옮겨놓은 기분이에요',
  })
  @IsString()
  recapMessage: string;

  @ApiProperty({
    description: '전체 트리 개수에 따른 종합 요약 이미지 URL',
    example: 'https://example.com/images/level_2.png',
  })
  @IsString()
  recapImageUrl: string;

  @ApiProperty({
    description: '가장 큰 트리',
    type: MypageTreeResponse,
  })
  @IsNotEmpty()
  biggestTrees: MypageTreeResponse[];

  @ApiProperty({
    description: '내 트리 목록',
    type: [MypageTreeResponse],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MypageTreeResponse)
  myTrees: MypageTreeResponse[];

  @ApiProperty({
    description: '물을 준 트리 목록',
    type: [MypageTreeResponse],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MypageTreeResponse)
  wateredTrees: MypageTreeResponse[];

  @ApiProperty({
    description: '팔로우 신청이 있는지 여부와 신청의 상태를 나타냅니다.',
  })
  followStatus: CheckFollowingStatusDto | null;
}

