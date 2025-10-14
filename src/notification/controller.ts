import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Res,
  HttpStatus,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { User } from '@/decorators/user.decorator';
import { GetUserNotificationsUseCase } from './usecases/getUserNotifications';
import { NotificationService } from './service';
import { UpdateFcmTokenDto } from '@/user/dtos/updateFcmToken.dto';
import { GetUserNotificationsResult } from './params';
import { NotificationListResponseDto } from './dto';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
    private readonly notificationService: NotificationService,
  ) {}

  // 내 푸시 알림 히스토리를 최근순으로 조회합니다.
  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiResponse({
    status: 200,
    description: 'Get my notifications (recent first) with pagination',
    type: NotificationListResponseDto,
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

    return res.status(HttpStatus.OK).json({
      notifications: result.notifications,
      totalCount: result.total,
      currentPage: page,
      perPage,
    });
  }

  @Post('fcm-token')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Update FCM token',
    description: 'Update user FCM token',
  })
  async updateFcmToken(
    @User('id') userId: string,
    @Body() body: UpdateFcmTokenDto,
    @Res() res: Response,
  ) {
    await this.notificationService.updateFcmToken(userId, body.fcmToken);
    return res.status(HttpStatus.OK).send();
  }
}
