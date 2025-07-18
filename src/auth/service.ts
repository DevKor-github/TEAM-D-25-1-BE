import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseInformation } from './interfaces/firbase-info.interface';
import * as admin from 'firebase-admin';
import { OnboardingInfoRequest } from './dto/onboarding.dto';
import { RegisterRequest } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { SocialProvider, User } from '@prisma/client';
import { FirebaseLoginResponseDto } from './dto/authUser.dto';
import { sign as signJwt } from '../auth/libs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('FIREBASE_ADMIN') private readonly firebaseApp: admin.app.App,
  ) {}
  async validateUser(decoded: FirebaseInformation) {
    const user = await this.prismaService.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      throw new UnauthorizedException('가입되지 않은 회원');
    }
    return user;
  }

  async register(
    registerDto: RegisterRequest,
  ): Promise<{ accessToken: string; user: any }> {
    try {
      const firebaseUser = await this.firebaseApp.auth().createUser({
        email: registerDto.email,
        password: registerDto.password,
        displayName: registerDto.nickname,
      });

      const user = await this.prismaService.user.create({
        data: {
          firebaseUid: firebaseUser.uid,
          email: registerDto.email,
          nickname: registerDto.nickname,
          username: `user_${firebaseUser.uid.slice(0, 8)}`,
          isOnboarded: false,
        },
      });

      // JWT 토큰 발급
      const accessToken = signJwt({ uid: user.id });

      return {
        accessToken,
        user,
      };
    } catch (error: any) {
      console.error('Error in AuthService.register:', error);

      const errorMessage = error.message || '알 수 없는 회원가입 오류';

      throw new Error(`회원가입 실패: ${errorMessage}`);
    }
  }

  async completeOnboarding(
    userId: string,
    onboardingData: OnboardingInfoRequest,
  ): Promise<User> {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...onboardingData,
          isOnboarded: true,
        },
      });
      return updatedUser;
    } catch (error) {
      throw new HttpException(
        `온보딩 실패: ${error.message || '알 수 없는 오류'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async firebaseLoginOrRegister(
    firebaseAccessToken: string,
    providerType?: SocialProvider,
  ): Promise<FirebaseLoginResponseDto> {
    try {
      // 1. firebaseAccessToken 검증 및 uid 추출
      const decoded = await this.firebaseApp
        .auth()
        .verifyIdToken(firebaseAccessToken);
      const firebaseUid = decoded.uid;

      // 2. 유저 조회
      let user = await this.prismaService.user.findUnique({
        where: { firebaseUid },
      });
      if (user) {
        // 로그인: JWT 토큰 반환
        const accessToken = signJwt({ uid: user.id });
        return { accessToken, user };
      } else {
        // 회원가입: firebase에서 정보 추출 후 생성
        const fbUser = await this.firebaseApp.auth().getUser(firebaseUid);

        const email = fbUser.email;
        const displayName = fbUser.displayName;
        if (!email)
          throw new UnauthorizedException('이메일이 없는 계정입니다.');
        user = await this.prismaService.user.create({
          data: {
            firebaseUid,
            email,
            username: `user_${firebaseUid.slice(0, 8)}`,
            nickname: displayName || '',
            isOnboarded: false,
            socialProvider: providerType,
          },
        });
        const accessToken = signJwt({ uid: user.id });
        return { accessToken, user };
      }
    } catch (error) {
      throw new HttpException(
        `firebase 로그인/회원가입 실패: ${error.message || '알 수 없는 오류'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
