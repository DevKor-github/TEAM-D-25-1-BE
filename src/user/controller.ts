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
  Patch,
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
import { UpdateFcmTokenUseCase } from './usecases/updateFcmToken';
import { UpdateFcmTokenDto } from './dtos/updateFcmToken.dto';
import { UserParam } from './params/user';
import { UpdateProfileImageUseCase } from './usecases/updateProfileImage';
import { UpdateProfileImageDto } from './dtos/updateProfileImage.dto';
import { GetMyProfileUseCase } from './usecases/getMyProfile';
import { MyProfileResponseDto } from './dtos/my-profile.response.dto';

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
    private readonly updateFcmTokenUseCase: UpdateFcmTokenUseCase,
    private readonly updateProfileImageUseCase: UpdateProfileImageUseCase,
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
  ) {}

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get my profile',
    type: MyProfileResponseDto,
  })
  async getMyProfile(@User() user: any, @Res() res: Response) {
    const result = await this.getMyProfileUseCase.execute(user.id);
    return res.status(HttpStatus.OK).json(result);
  }

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

  @Patch('me/fcm-token')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update FCM token',
    type: UserParam,
  })
  async updateFcmToken(
    @User() user: any,
    @Body() body: UpdateFcmTokenDto,
    @Res() res: Response,
  ) {
    const result = await this.updateFcmTokenUseCase.execute(user.id, body);
    return res.status(HttpStatus.OK).json(result);
  }

  @Patch('me/profile-image')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update profile image',
    type: UserParam,
  })
  async updateProfileImage(
    @User() user: any,
    @Body() body: UpdateProfileImageDto,
    @Res() res: Response,
  ) {
    const result = await this.updateProfileImageUseCase.execute(user.id, body);
    return res.status(HttpStatus.OK).json(result);
  }
}
