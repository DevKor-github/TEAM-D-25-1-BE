import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '../auth/module';
import { RestaurantRepository } from './repositories/restaurant';
import { RestaurantController } from './controller';

@Module({
  imports: [AuthModule],
  controllers: [RestaurantController],
  providers: [PrismaService, RestaurantRepository],
  exports: [],
})
export class RestaurantModule {}
