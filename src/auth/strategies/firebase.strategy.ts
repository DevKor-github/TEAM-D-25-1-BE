import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy, 'firebase-auth') {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseApp: admin.app.App,
  ){
    super();
  }

  async validate(token: string): Promise<any> {
    if (!token) {
      throw new UnauthorizedException('토큰이 제공되지 않았습니다.');
    }
    try {
      const decoded = await this.firebaseApp.auth().verifyIdToken(token);
      return { uid: decoded.uid, ...decoded };
    } catch (error) {
      throw new UnauthorizedException('인증에 실패했습니다.');
    }
  }
} 