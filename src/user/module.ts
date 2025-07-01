import { Module } from '@nestjs/common';
import { UserService } from './service';
import { UserController } from './controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './repositories/user';
import { GetFollowingListUseCase } from './usecases/getFollowingList';
import { FollowerRepository } from './repositories/follower';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';
import { TreeModule } from '@/tree/module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    FollowerRepository,
    GetFollowingListUseCase,
    RestaurantRepository,
  ],
})
export class UserModule {}
