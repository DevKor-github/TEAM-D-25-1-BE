import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/user/repositories/user';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';
import { RestaurantListResponse, RestaurantResponse } from './dto';
import { Restaurant } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async getRestaurantList(
    perPage: number,
    page: number,
  ): Promise<RestaurantListResponse> {
    const pageContents: Restaurant[] =
      await this.restaurantRepository.getAllRestaurants(perPage, page);

    const totals = await this.restaurantRepository.getRestaurantsCount();
    const totalPages = Math.ceil(totals / perPage);

    return {
      items: pageContents.map(RestaurantResponse.from),
      totalPages,
    } satisfies RestaurantListResponse;
  }
}
