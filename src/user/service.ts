import { Injectable } from '@nestjs/common';
import { UserRepository } from './repository';
import { RestaurantListResponse, RestaurantResponse } from './dto';
import { Restaurant } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getRestaurantList(
    perPage: number,
    page: number,
  ): Promise<RestaurantListResponse> {
    const pageContents: Restaurant[] =
      await this.userRepository.getAllRestaurants(perPage, page);

    const totals = await this.userRepository.getRestaurantsCount();
    const totalPages = Math.ceil(totals / perPage);

    return {
      items: pageContents.map(RestaurantResponse.from),
      totalPages,
    } satisfies RestaurantListResponse;
  }
}
