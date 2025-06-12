import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TreeService } from './service';
import { Response } from 'express';
import { Coordinate, PlantTreeDto } from './dto';
import { User } from '../decorators/user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('tree')
@UseGuards(FirebaseAuthGuard)
export class TreeController {
  constructor(private readonly tree: TreeService) {}

  @Get()
  async getTreesByLocation(
    @Query() location: Coordinate,
    @Res() res: Response,
  ) {
    const result = await this.tree.getTreesByLocation(location);
    return res.status(HttpStatus.OK).json(result);
  }

  @Get(':treeId')
  async getTreeById(
    @Param('treeId') treeId: string,
    @User() userId: string,
    @Res() res: Response,
  ) {
    const result = await this.tree.getTreeById(treeId, userId);
    return res.status(HttpStatus.OK).json(result);
  }

  @Post(':treeId/water')
  async waterTree(
    @Param('treeId') treeId: string,
    @User() userId: string,
    @Res() res: Response,
  ) {
    const result = await this.tree.waterTree(treeId, userId);
    return res.status(HttpStatus.OK).json(result);
  }

  @Post()
  async plantTree(
    @Body() plantTreeDto: PlantTreeDto,
    @User() userId: string,
    @Res() res: Response,
  ) {
    const result = await this.tree.plantTree(plantTreeDto, userId);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Post('recommendations')
  async getRecommendations(@Res() res: Response) {
    const result = await this.tree.getRecommendations();
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('friends')
  async getFriends(
    @Query('restaurantId') restaurantId: string,
    @User() userId: string,
    @Res() res: Response,
  ) {
    const result = this.tree.getAllFriendsTree(userId, restaurantId);
    return res.status(HttpStatus.OK).json(result);
  }
}
