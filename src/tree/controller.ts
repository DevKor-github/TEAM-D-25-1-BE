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
import { Coordinate, PlantTreeDto, TreeDetailResponse, TreeListResponse } from './dto';
import { User } from '../decorators/user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { 
  ApiBearerAuth,
  ApiBody, 
  ApiOperation, 
  ApiParam, 
  ApiQuery, 
  ApiResponse, 
  ApiTags
} from '@nestjs/swagger';

@ApiTags('tree')
@ApiBearerAuth()
@Controller('tree')
//@UseGuards(FirebaseAuthGuard)
export class TreeController {
  constructor(private readonly tree: TreeService) {}

  @Get()
  @ApiOperation({ summary: '좌표 기준 주변 나무 목록 조회' })
  @ApiQuery({ name: 'lat', description: '위도', type: String, example: '37.5665' })
  @ApiQuery({ name: 'lon', description: '경도', type: String, example: '126.9780' })
  @ApiResponse({
    status: 200,
    description: '나무 목록 반환',
    type: TreeListResponse,
  })
  async getTreesByLocation(
    @Query() location: Coordinate,
    @Query() zoom: number,
    @User() userId: string,
    @Res() res: Response,
  ) {
    const result = await this.tree.getTreesByLocation(userId, zoom, location);
    return res.status(HttpStatus.OK).json(result);
  }

  @Get(':treeId')
  @ApiOperation({ summary: '특정 나무 상세 조회' })
  @ApiParam({ name: 'treeId', description: '나무 UUID', type: String, example: 'uuid-1234-...' })
  @ApiResponse({
    status: 200,
    description: '나무 상세 정보 반환',
    type: TreeDetailResponse,
  })
  async getTreeById(
    @Param('treeId') treeId: string,
    @User() userId: string,
    @Res() res: Response,
  ) {
    const result = await this.tree.getTreeById(treeId, userId);
    return res.status(HttpStatus.OK).json(result);
  }

  @Post(':treeId/water')
  @ApiOperation({ summary: '나무에 물 주기' })
  @ApiParam({ name: 'treeId', description: '나무 UUID', type: String, example: 'uuid-1234-...' })
  @ApiResponse({
    status: 200,
    description: '물주기 결과 반환',
    type: TreeDetailResponse,
  })
  async waterTree(
    @Param('treeId') treeId: string,
    @User() userId: string,
    @Res() res: Response,
  ) {
    const result = await this.tree.waterTree(treeId, userId);
    return res.status(HttpStatus.OK).json(result);
  }

  @Post()
  @ApiOperation({ summary: '새 나무 심기' })
  @ApiBody({ type: PlantTreeDto })
  @ApiResponse({
    status: 201,
    description: '심기 성공 시 생성된 나무 정보',
    type: TreeDetailResponse,
  })
  async plantTree(
    @Body() plantTreeDto: PlantTreeDto,
    @User() userId: string,
    @Res() res: Response,
  ) {
    const result = await this.tree.plantTree(plantTreeDto, userId);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Post('recommendations')
  @ApiOperation({ summary: '추천 나무 조회' })
  @ApiResponse({
    status: 200,
    description: '추천 되는 나무를 반환',
    type: TreeListResponse,
  })
  async getRecommendations(@Res() res: Response) {
    const result = await this.tree.getRecommendations();
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('followers')
  @ApiOperation({ summary: '팔로워 나무 조회' })
  @ApiQuery({ name: 'restaurantId', description: '식당 UUID', type: String, example: 'uuid-1234-...' })
  @ApiResponse({
    status: 200,
    description: '팔로워들이 심은 나무 목록 반환',
    type: TreeListResponse,
  })
  async getFollowers(
    @Query('restaurantId') restaurantId: string,
    @User() userId: string,
    @Res() res: Response,
  ) {
    const result = this.tree.getFollowersTree(userId, restaurantId);
    return res.status(HttpStatus.OK).json(result);
  }
}
