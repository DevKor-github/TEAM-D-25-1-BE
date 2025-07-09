import { Test, TestingModule } from '@nestjs/testing';
import { FCMService, FCMMessage } from './fcm';

describe('FCMService', () => {
  let service: FCMService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FCMService],
    }).compile();

    service = module.get<FCMService>(FCMService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotificationMessage', () => {
    it('should create a notification message with title and body', () => {
      const message = service.createNotificationMessage(
        '테스트 제목',
        '테스트 내용',
      );

      expect(message.notification).toBeDefined();
      expect(message.notification.title).toBe('테스트 제목');
      expect(message.notification.body).toBe('테스트 내용');
      expect(message.android).toBeDefined();
      expect(message.apns).toBeDefined();
    });

    it('should create a notification message with data', () => {
      const data = { key: 'value', type: 'notification' };
      const message = service.createNotificationMessage(
        '테스트 제목',
        '테스트 내용',
        data,
      );

      expect(message.data).toEqual(data);
    });
  });

  describe('FCMService usage examples', () => {
    it('should demonstrate how to send notification to single user', async () => {
      // 실제 테스트에서는 mock을 사용해야 합니다
      const fcmToken = 'test-fcm-token';
      const message: FCMMessage = {
        notification: {
          title: '새로운 팔로우',
          body: '사용자가 당신을 팔로우했습니다!',
        },
        data: {
          type: 'follow',
          userId: '123',
        },
      };

      // 실제 구현에서는 다음과 같이 사용합니다:
      // await service.sendToUser(fcmToken, message);

      expect(service).toBeDefined();
    });

    it('should demonstrate how to send notification to multiple users', async () => {
      const fcmTokens = ['token1', 'token2', 'token3'];
      const message = service.createNotificationMessage(
        '새로운 게시물',
        '팔로우하는 사용자가 새 게시물을 올렸습니다.',
        { type: 'new_post' },
      );

      // 실제 구현에서는 다음과 같이 사용합니다:
      // await service.sendToUsers(fcmTokens, message);

      expect(service).toBeDefined();
    });

    it('should demonstrate how to send notification to topic', async () => {
      const topic = 'general_notifications';
      const message = service.createNotificationMessage(
        '시스템 공지',
        '새로운 기능이 추가되었습니다.',
        { type: 'system_notice' },
      );

      // 실제 구현에서는 다음과 같이 사용합니다:
      // await service.sendToTopic(topic, message);

      expect(service).toBeDefined();
    });
  });
});
