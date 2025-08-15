import { Injectable } from '@nestjs/common';
import { 
  FOOD_TAG_KOREAN_MAP, 
  STYLE_TAG_KOREAN_MAP, 
  TAG_KOREAN_MAP 
} from '@/tree/constants';
import { AppSettings, Tag } from './dto';
import { Mbti } from '@prisma/client';

@Injectable()
export class SettingsService {
  
  private convertMapToArray(param: Record<string, string>): Tag[] {
    return Object.entries(param).map(([key, value]) => ({ key, value }));
  }

  async getSettings(): Promise<AppSettings> {
    // TODO: Implement get app settings logic
    
    const tags = this.convertMapToArray(TAG_KOREAN_MAP)
    const foodTags = this.convertMapToArray(FOOD_TAG_KOREAN_MAP)
    const styleTags = this.convertMapToArray(STYLE_TAG_KOREAN_MAP)
    const mbti = Object.values(Mbti);

    return {
      maintenance: false,
      minimalVersion: '1.0.0',
      tags,
      foodTags,
      styleTags,
      mbti
    };
  }

  async updateSettings(settings: Partial<AppSettings>) {
    // TODO: Implement update app settings logic
    return {
      message: 'App settings updated successfully',
    };
  }
}
