import { Inject, Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface FCMNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
}

export interface FCMDataPayload {
  [key: string]: string;
}

export interface FCMMessage {
  notification?: FCMNotificationPayload;
  data?: FCMDataPayload;
  android?: {
    priority?: 'normal' | 'high';
    notification?: {
      sound?: string;
      channelId?: string;
    };
  };
  apns?: {
    payload: {
      aps: {
        sound?: string;
        badge?: number;
      };
    };
  };
}

@Injectable()
export class FCMService {
  private readonly logger = new Logger(FCMService.name);

  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseApp: admin.app.App,
  ) {
    this.logger.log('FCM Service initialized');
  }

  /**
   * 단일 사용자에게 FCM 메시지 전송
   */
  async sendToUser(fcmToken: string, message: FCMMessage): Promise<string> {
    try {
      this.logger.log(`FCM 메시지 전송 시작: ${fcmToken.substring(0, 20)}...`);

      const response = await this.firebaseApp.messaging().send({
        token: fcmToken,
        ...message,
      });

      this.logger.log(`FCM 메시지 전송 성공: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`FCM 메시지 전송 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 여러 사용자에게 FCM 메시지 전송
   */
  async sendToUsers(
    fcmTokens: string[],
    message: FCMMessage,
  ): Promise<admin.messaging.BatchResponse> {
    try {
      this.logger.log(
        `${fcmTokens.length}명의 사용자에게 FCM 메시지 전송 시작`,
      );

      const response = await this.firebaseApp.messaging().sendEachForMulticast({
        tokens: fcmTokens,
        ...message,
      });

      this.logger.log(
        `FCM 메시지 전송 완료: 성공 ${response.successCount}, 실패 ${response.failureCount}`,
      );

      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((resp, idx) => (!resp.success ? fcmTokens[idx] : null))
          .filter(Boolean);
        this.logger.warn(`전송 실패한 토큰들: ${failedTokens.join(', ')}`);
      }

      return response;
    } catch (error) {
      this.logger.error(
        `FCM 다중 메시지 전송 실패: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 토픽을 구독한 모든 사용자에게 FCM 메시지 전송
   */
  async sendToTopic(topic: string, message: FCMMessage): Promise<string> {
    try {
      this.logger.log(`토픽 "${topic}"에 FCM 메시지 전송 시작`);

      const response = await this.firebaseApp.messaging().send({
        topic,
        ...message,
      });

      this.logger.log(`토픽 FCM 메시지 전송 성공: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(
        `토픽 FCM 메시지 전송 실패: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 사용자를 토픽에 구독시키기
   */
  async subscribeToTopic(
    fcmTokens: string[],
    topic: string,
  ): Promise<admin.messaging.MessagingTopicManagementResponse> {
    try {
      this.logger.log(
        `${fcmTokens.length}명의 사용자를 토픽 "${topic}"에 구독시키기`,
      );

      const response = await this.firebaseApp
        .messaging()
        .subscribeToTopic(fcmTokens, topic);

      this.logger.log(
        `토픽 구독 완료: 성공 ${response.successCount}, 실패 ${response.failureCount}`,
      );

      return response;
    } catch (error) {
      this.logger.error(`토픽 구독 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자를 토픽에서 구독 해제하기
   */
  async unsubscribeFromTopic(
    fcmTokens: string[],
    topic: string,
  ): Promise<admin.messaging.MessagingTopicManagementResponse> {
    try {
      this.logger.log(
        `${fcmTokens.length}명의 사용자를 토픽 "${topic}"에서 구독 해제하기`,
      );

      const response = await this.firebaseApp
        .messaging()
        .unsubscribeFromTopic(fcmTokens, topic);

      this.logger.log(
        `토픽 구독 해제 완료: 성공 ${response.successCount}, 실패 ${response.failureCount}`,
      );

      return response;
    } catch (error) {
      this.logger.error(`토픽 구독 해제 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * FCM 토큰 유효성 검사
   */
  async validateToken(fcmToken: string): Promise<boolean> {
    try {
      // 간단한 토큰 형식 검증
      if (!fcmToken || fcmToken.length < 100) {
        return false;
      }

      // 실제 토큰 유효성 검증을 위해 테스트 메시지 전송 시도
      await this.firebaseApp.messaging().send({
        token: fcmToken,
        data: {
          test: 'validation',
        },
      });

      return true;
    } catch (error) {
      this.logger.warn(`FCM 토큰 유효성 검사 실패: ${error.message}`);
      return false;
    }
  }

  /**
   * 간단한 알림 메시지 생성 헬퍼 메서드
   */
  createNotificationMessage(
    title: string,
    body: string,
    data?: FCMDataPayload,
  ): FCMMessage {
    return {
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };
  }
}
