import { Injectable } from '@nestjs/common';
import { SearchRestaurantTagRepository } from '../repositories/searchRestaurantTag';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';
import { RestaurantEntity } from '@/restaurant/entity';

@Injectable()
export class SearchRestaurantUseCase {
  constructor(
    private readonly searchRestaurantRepository: SearchRestaurantTagRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  // FIXME: I'm not sure about the searchQuery work like this.
  // Maybe need cursor pagination for this
  async execute(
    query: string,
    page: number,
    perPage: number,
  ): Promise<RestaurantEntity[]> {
    const restaurantIds: string[] =
      await this.searchRestaurantRepository.getIdList(query, page, perPage);

    const restaurants: RestaurantEntity[] =
      await this.restaurantRepository.getRestaurantsByIds(restaurantIds);

    return restaurants;
  }
}
