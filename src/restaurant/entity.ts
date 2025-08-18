import { ApiProperty } from '@nestjs/swagger';

export class RestaurantEntity {
  id: string;
  placeId: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  createdAt: Date;
}
