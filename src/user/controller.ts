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
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  FollowerListResponse,
  FollowerResponse,
  FollowingListResponse,
  HandleFollowRequest,
  RestaurantListResponse,
} from './dto';
import { GetFollowingListUseCase } from './usecases/getFollowingList';
import { HandleFollowUseCase } from './usecases/handleFollow';
import { FollowUserUseCase } from './usecases/followUser';
import { FirebaseAuthGuard } from '@/auth/guards/firebase-auth.guard';
import { User } from '@/decorators/user.decorator';
import { GetPendingFollowListUseCase } from './usecases/getPendingFollowList';
import { GetFollowerListUseCase } from './usecases/getFollowerList';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly getFollowingListUseCase: GetFollowingListUseCase,
    private readonly handleFollowUseCase: HandleFollowUseCase,
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly getPendingFollowerListUseCase: GetPendingFollowListUseCase,
    private readonly getFollowerListUseCase: GetFollowerListUseCase,
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

    return res.status(HttpStatus.OK).json(result); // TODO: into FollowerResponse
  }

  @Post(':userId/follow')
  @UseGuards(FirebaseAuthGuard) // TODO: fix to jwt guard
  @ApiResponse({
    status: 201,
    description: 'Follow User',
    type: FollowerResponse,
  })
  async handleFollowUser(
    @Param('userId') userId: string,
    @User() user: any,
    @Res() res: Response,
  ) {
    const result = await this.followUserUseCase.execute(user.id, userId);
    return res.status(HttpStatus.CREATED).json(result); // TODO: into FollowerResponse
  }

  @Get('me/followers/pending')
  @UseGuards(FirebaseAuthGuard) // TODO: fix to jwt guard
  @ApiResponse({
    status: 200,
    description: 'Get pending follower list',
    type: FollowerListResponse,
  })
  async getPendingFollowerList(
    @User() user: any,
    @Query('per_page', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Res() res: Response,
  ) {
    const result = await this.getPendingFollowerListUseCase.execute(
      user.id,
      perPage,
      page,
    );

    return res.status(HttpStatus.OK).json(result); // TODO: Formatting
  }

  @Get('me/followers')
  @UseGuards(FirebaseAuthGuard) // TODO: fix to jwt guard
  @ApiResponse({
    status: 200,
    description: 'Get follower list',
    type: FollowerListResponse,
  })
  async getFollowerList(
    @User() user: any,
    @Query('per_page', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Res() res: Response,
  ) {
    const result = await this.getFollowerListUseCase.execute(
      user.id,
      perPage,
      page,
    );
    return res.status(HttpStatus.OK).json(result); // TODO: Formatting
  }
}
