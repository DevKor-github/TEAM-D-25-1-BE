import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  ParseIntPipe,
  Query,
  Res,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FollowingListResponse, RestaurantListResponse } from './dto';
import { GetFollowingListUseCase } from './usecases/getFollowingList';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly getFollowingListUseCase: GetFollowingListUseCase,
  ) {}

  @Get('me/restaurants')
  @ApiResponse({
    status: 200,
    description: 'Get restaurant list',
    type: RestaurantListResponse,
  })
  async check(
    @Query('per_page', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Res() res: Response,
  ) {
    const result = await this.userService.getRestaurantList(perPage, page);
    return res.status(HttpStatus.OK).json(result);
  }

  @Get(':userId/following')
  @ApiResponse({
    status: 200,
    description: 'Get following list',
    type: FollowingListResponse,
  })
  async getFollowingList(
    @Param('userId') userId: string,
    @Query('per_page', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Res() res: Response,
  ) {
    const result = await this.getFollowingListUseCase.execute(
      userId,
      perPage,
      page,
    );
    return res.status(HttpStatus.OK).json(result);
  }
}
