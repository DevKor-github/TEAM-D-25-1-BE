import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchRestaurantUseCase } from './usecases/searchRestaurant';
import { SearchUserUseCase } from './usecases/searchUser';
import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SearchUserListResponse, SearchUserResponse } from './dto/searchUser';
import SearchRestaurantResponse, {
  SearchRestaurantListResponse,
} from './dto/searchRestaurant';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchRestaurantUseCase: SearchRestaurantUseCase,
    private readonly searchUserUseCase: SearchUserUseCase,
  ) {}

  @Get('users')
  @ApiResponse({
    status: 200,
    description: 'Search users',
    type: SearchUserListResponse,
  })
  async searchUsers(
    @Query('query') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per_page', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
  ) {
    const result = await this.searchUserUseCase.execute(query, page, perPage);
    const items = result.map(SearchUserResponse.from);
    return {
      items,
    };
  }

  @Get('restaurants')
  @ApiResponse({
    status: 200,
    description: 'Search restaurants',
    type: SearchRestaurantListResponse,
  })
  async searchRestaurants(
    @Query('query') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per_page', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
  ) {
    const result = await this.searchRestaurantUseCase.execute(
      query,
      page,
      perPage,
    );
    const items = result.map(SearchRestaurantResponse.from);
    return {
      items,
    };
  }
}
