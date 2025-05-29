import { Module } from '@nestjs/common';
import { UserService } from './service';
import { UserController } from './controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './repository';
import { GetFollowingListUseCase } from './usecases/getFollowingList';
import { FollowerRepository } from './repositories/follower';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    GetFollowingListUseCase,
    FollowerRepository,
  ],
})
export class UserModule {}
