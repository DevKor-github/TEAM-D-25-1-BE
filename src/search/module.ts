import { PrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { SearchRestaurantUseCase } from './usecases/searchRestaurant';
import { SearchUserUseCase } from './usecases/searchUser';
import { SearchUserTagRepository } from './repositories/searchUserTag';
import { SearchRestaurantTagRepository } from './repositories/searchRestaurantTag';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';
import { SearchController } from './controller';
import { UserRepository } from '@/user/repositories/user';

@Module({
  imports: [],
  controllers: [SearchController],
  providers: [
    PrismaService,
    SearchRestaurantUseCase,
    SearchUserUseCase,
    SearchRestaurantTagRepository,
    SearchUserTagRepository,
    RestaurantRepository,
    UserRepository,
  ],
})
export class SearchModule {}
