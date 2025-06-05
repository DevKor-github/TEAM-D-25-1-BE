import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RestaurantListResponse } from './dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users/me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('restaurants')
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
}
