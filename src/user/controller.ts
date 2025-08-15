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
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import {
  UpdateProfileDto,
  UpdateMbtiAndTagsDto,
  UpdateProfileResponseDto,
} from './dtos/updateProfile.dto';
import { UpdateProfileUseCase } from './usecases/updateProfile';
import { UpdateMbtiAndTagsUseCase } from './usecases/updateMbtiAndTags';

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
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly updateMbtiAndTagsUseCase: UpdateMbtiAndTagsUseCase,
  ) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiResponse({
    status: 200,
    description: 'Get my profile',
    type: MyProfileResponseDto,
  })
  async getMyProfile(@User('id') userId: string, @Res() res: Response) {
    const result = await this.getMyProfileUseCase.execute(userId);
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
  @UseGuards(AccessTokenGuard) // TODO: fix to jwt guard
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
  @UseGuards(AccessTokenGuard) // TODO: fix to jwt guard
  @ApiResponse({
    status: 200,
    description: 'Get pending follower list',
    type: FollowerListResponse,
  })
  async getPendingFollowerList(
    @User('id') userId: string,
    @Query('per_page', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Res() res: Response,
  ) {
    const result = await this.getPendingFollowerListUseCase.execute(
      userId,
      perPage,
      page,
    );

    return res.status(HttpStatus.OK).json(result); // TODO: Formatting
  }

  @Get('me/followers')
  @UseGuards(AccessTokenGuard) // TODO: fix to jwt guard
  @ApiResponse({
    status: 200,
    description: 'Get follower list',
    type: FollowerListResponse,
  })
  async getFollowerList(
    @User('id') userId: string,
    @Query('per_page', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Res() res: Response,
  ) {
    const result = await this.getFollowerListUseCase.execute(
      userId,
      perPage,
      page,
    );
    return res.status(HttpStatus.OK).json(result); // TODO: Formatting
  }

  @Patch('me/fcm-token')
  @UseGuards(AccessTokenGuard)
  @ApiResponse({
    status: 200,
    description: 'Update FCM token',
    type: UserParam,
  })
  async updateFcmToken(
    @User('id') userId: string,
    @Body() body: UpdateFcmTokenDto,
    @Res() res: Response,
  ) {
    const result = await this.updateFcmTokenUseCase.execute(userId, body);
    return res.status(HttpStatus.OK).json(result);
  }

  @Patch('me/profile-image')
  @UseGuards(AccessTokenGuard)
  @ApiResponse({
    status: 200,
    description: 'Update profile image',
    type: UserParam,
  })
  async updateProfileImage(
    @User('id') userId: string,
    @Body() body: UpdateProfileImageDto,
    @Res() res: Response,
  ) {
    const result = await this.updateProfileImageUseCase.execute(userId, body);
    return res.status(HttpStatus.OK).json(result);
  }

  @Patch('me')
  @UseGuards(AccessTokenGuard)
  @ApiResponse({
    status: 200,
    description: 'Update my profile (basic fields)',
    type: UpdateProfileResponseDto,
  })
  async updateMyProfile(
    @User('id') userId: string,
    @Body() body: UpdateProfileDto,
    @Res() res: Response,
  ) {
    const result = await this.updateProfileUseCase.execute(userId, body);
    return res.status(HttpStatus.OK).json(result);
  }

  @Patch('me/preferences')
  @UseGuards(AccessTokenGuard)
  @ApiResponse({
    status: 200,
    description: 'Update my preferences (mbti, tags)',
    type: UpdateProfileResponseDto,
  })
  async updateMyPreferences(
    @User('id') userId: string,
    @Body() body: UpdateMbtiAndTagsDto,
    @Res() res: Response,
  ) {
    const result = await this.updateMbtiAndTagsUseCase.execute(userId, body);
    return res.status(HttpStatus.OK).json(result);
  }
}
