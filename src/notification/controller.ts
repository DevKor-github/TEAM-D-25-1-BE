import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { User } from '@/decorators/user.decorator';
import { GetUserNotificationsUseCase } from './usecases/getUserNotifications';
import { GetUserNotificationsResult } from './params';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
  ) {}

  // 내 푸시 알림 히스토리를 최근순으로 조회합니다.
  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiResponse({
    status: 200,
    description: 'Get my notifications (recent first) with pagination',
    type: Object,
  })
  async getMyNotifications(
    @User('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per_page', new DefaultValuePipe(20), ParseIntPipe) perPage: number,
    @Res() res: Response,
  ) {
    const result: GetUserNotificationsResult =
      await this.getUserNotificationsUseCase.execute({
        userId,
        page,
        limit: perPage,
      });

    return res.status(HttpStatus.OK).json(result);
  }
}
