import { Controller, Get, HttpStatus, Res, Patch, Body } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './service';
import {
  GetSettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  AppSettings,
} from './dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get app settings',
    type: GetSettingsResponse,
  })
  async getSettings(@Res() res: Response) {
    const settings: AppSettings = await this.settingsService.getSettings();
    return res.status(HttpStatus.OK).json({
      settings,
    });
  }
}
