import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  ParseIntPipe,
  Query,
  Res,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  FollowerResponse,
  FollowingListResponse,
  HandleFollowRequest,
  RestaurantListResponse,
} from './dto';
import { GetFollowingListUseCase } from './usecases/getFollowingList';
import { HandleFollowUseCase } from './usecases/handleFollow';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly getFollowingListUseCase: GetFollowingListUseCase,
    private readonly handleFollowUseCase: HandleFollowUseCase,
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

  @Post(':userId/following/:followerId')
  @ApiResponse({
    status: 200,
    description: 'Accept or reject follow request',
    type: FollowerResponse,
  })
  async handleFollow(
    @Param('userId') userId: string,
    @Param('followerId') followerId: string,
    @Body() body: HandleFollowRequest,
    @Res() res: Response,
  ) {
    const result = await this.handleFollowUseCase.execute(
      userId,
      followerId,
      body.status,
    );

    return res.status(HttpStatus.OK).json(result);
  }
}
