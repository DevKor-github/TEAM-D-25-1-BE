import { Module } from '@nestjs/common';
import { UserService } from './service';
import { UserController } from './controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './repositories/user';
import { GetFollowingListUseCase } from './usecases/getFollowingList';
import { FollowerRepository } from './repositories/follower';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';
import { HandleFollowUseCase } from './usecases/handleFollow';
import { FollowUserUseCase } from './usecases/followUser';
import { GetPendingFollowListUseCase } from './usecases/getPendingFollowList';
import { GetFollowerListUseCase } from './usecases/getFollowerList';
import { UpdateFcmTokenUseCase } from './usecases/updateFcmToken';
import { UpdateProfileImageUseCase } from './usecases/updateProfileImage';
import { GetMyProfileUseCase } from './usecases/getMyProfile';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { UpdateProfileUseCase } from './usecases/updateProfile';
import { UpdateMbtiAndTagsUseCase } from './usecases/updateMbtiAndTags';

import { TreeModule } from '@/tree/module';
import { GetFollowingCountUsecase } from './usecases/getFollowingCount';
import { GetFollowerCountUsecase } from './usecases/getFollowerCount';
import { SearchUserTagRepository } from '@/search/repositories/searchUserTag';
import { GetUserProfileUseCase } from './usecases/getUserProfile';

@Module({
  imports: [PrismaModule, TreeModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    FollowerRepository,
    SearchUserTagRepository,
    FollowUserUseCase,
    GetFollowingListUseCase,
    GetPendingFollowListUseCase,
    GetFollowerListUseCase,
    RestaurantRepository,
    HandleFollowUseCase,
    UpdateFcmTokenUseCase,
    UpdateProfileImageUseCase,
    GetMyProfileUseCase,
    AccessTokenGuard,
    UpdateProfileUseCase,
    UpdateMbtiAndTagsUseCase,
    GetFollowerCountUsecase,
    GetFollowingCountUsecase,
    GetUserProfileUseCase,
  ],
})
export class UserModule {}
