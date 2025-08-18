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
import {
  Coordinate,
  PlantTreeDto,
  TreeDetailListResponse,
  TreeDetailResponse,
  TreeDetailWithUserListResponse,
  TreeDetailWithUserResponse,
  TreeListResponse,
} from './dto';
import { User } from '../decorators/user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { UserParam } from '@/user/params/user';

@ApiTags('tree')
@ApiBearerAuth()
@Controller('tree')
@UseGuards(AccessTokenGuard)
export class TreeController {
  constructor(private readonly tree: TreeService) {}

  @Get()
  @ApiOperation({ summary: '좌표 기준 주변 나무 목록 조회' })
  @ApiQuery({
    name: 'lat',
    description: '위도',
    type: String,
    example: '37.5665',
  })
  @ApiQuery({
    name: 'lon',
    description: '경도',
    type: String,
    example: '126.9780',
  })
  @ApiQuery({
    name: 'zoom',
    description: '줌 레벨',
    type: Number,
    example: 10,
  })
  @UseGuards(AccessTokenGuard)
  @ApiResponse({
    status: 200,
    description: '나무 목록 반환',
    type: TreeListResponse,
  })
  async getTreesByLocation(
    @Query() location: Coordinate,
    @Query() zoom: number,
    @User() user: UserParam,
    @Res() res: Response,
  ) {
    const result = await this.tree.getTreesByLocation(user, zoom, location);
    return res.status(HttpStatus.OK).json(TreeListResponse.from(result));
  }

  @Get(':treeId')
  @ApiOperation({ summary: '특정 나무 상세 조회' })
  @ApiParam({
    name: 'treeId',
    description: '나무 UUID',
    type: String,
    example: 'uuid-1234-..._uuid-1234-...',
  })
  @ApiResponse({
    status: 200,
    description: '나무 상세 정보 반환',
    type: TreeDetailResponse,
  })
  async getTreeById(
    @Param('treeId') treeId: string,
    @User() user: UserParam,
    @Res() res: Response,
  ) {
    const result = await this.tree.getTreeById(treeId, user);
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('restaurants/:restaurantId')
  @ApiOperation({ summary: '식당에 대한 나무 목록 반환' })
  @ApiParam({
    name: 'restaurantId',
    description: '식당 UUID',
    type: String,
    example: 'uuid-1234-...',
  })
  @ApiResponse({
    status: 200,
    description: '나무들 상세 정보 반환',
    type: TreeDetailListResponse,
  })
  async getTreeByRestaurantId(
    @Param('restaurantId') restaurantId: string,
    @User() user: UserParam,
    @Res() res: Response,
  ) {
    const result = await this.tree.getTreesByRestaurantId(restaurantId, user);
    return res
      .status(HttpStatus.OK)
      .json(TreeDetailWithUserListResponse.from(result));
  }

  @Post(':treeId/water')
  @ApiOperation({ summary: '나무에 물 주기' })
  @ApiParam({
    name: 'treeId',
    description: '나무 UUID',
    type: String,
    example: 'uuid-1234-...',
  })
  @ApiResponse({
    status: 200,
    description: '물주기 결과 반환',
    type: TreeDetailResponse,
  })
  @UseGuards(AccessTokenGuard)
  async waterTree(
    @Param('treeId') treeId: string,
    @User() user: UserParam,
    @Res() res: Response,
  ) {
    const result = await this.tree.waterTree(treeId, user);
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
  @UseGuards(AccessTokenGuard)
  async plantTree(
    @Body() plantTreeDto: PlantTreeDto,
    @User() user: UserParam,
    @Res() res: Response,
  ) {
    const result = await this.tree.plantTree(plantTreeDto, user);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Post('recommendations')
  @ApiOperation({ summary: '추천 나무 조회' })
  @ApiResponse({
    status: 200,
    description: '추천 되는 나무를 반환',
    type: TreeListResponse,
  })
  @UseGuards(AccessTokenGuard)
  async getRecommendations(@Res() res: Response) {
    const result = await this.tree.getRecommendations();
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('followers')
  @ApiOperation({ summary: '팔로워 나무 조회' })
  @ApiQuery({
    name: 'restaurantId',
    description: '식당 UUID',
    type: String,
    example: 'uuid-1234-...',
  })
  @ApiResponse({
    status: 200,
    description: '팔로워들이 심은 나무 목록 반환',
    type: TreeListResponse,
  })
  @UseGuards(AccessTokenGuard)
  async getFollowers(
    @Query('restaurantId') restaurantId: string,
    @User() user: UserParam,
    @Res() res: Response,
  ) {
    const result = this.tree.getFollowersTree(user, restaurantId);
    return res.status(HttpStatus.OK).json(result);
  }
}
