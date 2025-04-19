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

@Controller('users/me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('restaurants')
  async check(
    @Query('per_page', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Res() res: Response,
  ) {
    const result = await this.userService.getRestaurantList(perPage, page);
    return res.status(HttpStatus.OK).json(result);
  }
}
