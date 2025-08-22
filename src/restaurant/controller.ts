import {
  Controller,
  Get,
  HttpStatus,
  Injectable,
  Param,
  Res,
} from '@nestjs/common';
import { RestaurantRepository } from './repositories/restaurant';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RestaurantResponse } from '@/user/dto';

@ApiTags('restaurant')
@Injectable()
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly repo: RestaurantRepository) {}

  @Get(':restaurantId')
  @ApiResponse({
    status: 200,
    description: 'Get Restaurant information',
    type: RestaurantResponse,
  })
  async getRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Res() res: Response,
  ) {
    const resp = await this.repo.findById(restaurantId);

    if (!resp) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Restaurant not found',
      });
    }

    return res.status(HttpStatus.OK).json(RestaurantResponse.fromEntity(resp));
  }
}
