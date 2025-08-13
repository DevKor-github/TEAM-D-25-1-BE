import { Injectable } from '@nestjs/common';
import { FOOD_TAG_KOREAN_MAP } from '@/tree/constants';
import { AppSettings, FoodTag } from './dto';

@Injectable()
export class SettingsService {
  async getSettings(): Promise<AppSettings> {
    // TODO: Implement get app settings logic
    const foodTags: FoodTag[] = Object.entries(FOOD_TAG_KOREAN_MAP).map(
      ([key, value]) => ({
        key,
        value,
      }),
    );

    return {
      maintenance: false,
      minimalVersion: '1.0.0',
      foodTags,
    };
  }

  async updateSettings(settings: Partial<AppSettings>) {
    // TODO: Implement update app settings logic
    return {
      message: 'App settings updated successfully',
    };
  }
}
