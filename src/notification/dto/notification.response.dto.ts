import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    description: '알림 ID',
    example: 'notification-id-123',
  })
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: 'user-id-123',
  })
  userId: string;

  @ApiProperty({
    description: '썸네일 URL',
    example: 'https://example.com/thumbnail.jpg',
    required: false,
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description: '알림 타입',
    example: 'FOLLOW_REQUEST',
  })
  type: string;

  @ApiProperty({
    description: '표시할 내용',
    example: '새로운 팔로우 요청이 있습니다.',
  })
  displayContent: string;

  @ApiProperty({
    description: '클라이언트 이동용 딥링크',
    example: 'groo://profile/12345',
    required: false,
  })
  deeplink?: string;

  @ApiProperty({
    description: '생성 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({
    description: '알림 목록',
    type: [NotificationResponseDto],
  })
  notifications: NotificationResponseDto[];

  @ApiProperty({
    description: '총 알림 개수',
    example: 10,
  })
  totalCount: number;

  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
  })
  perPage: number;
}
