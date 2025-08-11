import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import request from 'supertest';
import { AuthService } from './service';
import { AuthController } from './controller';
import { CanActivate } from '@nestjs/common';
import { AccessTokenGuard } from './guards/access-token.guard';
import { User as UserType, Mbti, Tag } from '@prisma/client';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    applicationDefault: jest.fn(),
    cert: jest.fn(),
  },
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'firebase-uid' }),
  }),
}));

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;
  let mockAuthGuard: CanActivate;

  const mockDecodedFirebaseToken = {
    iss: 'https://securetoken.google.com/your-project-id',
    aud: 'your-project-id',
    auth_time: Math.floor(Date.now() / 1000) - 60,
    user_id: 'mockFirebaseUid-12345',
    sub: 'mockFirebaseUid-12345',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    email: 'test@example.com',
    email_verified: true,
    firebase: {
      identities: {
        email: ['test@example.com'],
      },
      'sign_in_provider': 'password',
    },
    uid: 'mockFirebaseUid-12345',
  };

  const mockPrismaUser: UserType = {
    id: 'user-id-from-database',
    email: 'test@example.com',
    username: 'testuser',
    nickname: 'testuser',
    socialProvider: null,
    socialId: null,
    isPrivate: false,
    status: 'ACTIVE',
    firebaseUid: 'mockFirebaseUid-12345',
    isOnboarded: true,
    mbti: Mbti.INFJ,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: '',
    profileImageUrl: '',
    fcmToken: '',
    fcmTokenUpdatedAt: undefined,
    lastWatered: undefined,
    tag: []
  };

  beforeEach(async () => {
    mockAuthGuard = { canActivate: jest.fn() };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            completeOnboarding: jest.fn(),
            register: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    authService = moduleFixture.get<AuthService>(AuthService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const expectedResponse = {
    id: mockPrismaUser.id,
    email: mockPrismaUser.email,
    username: mockPrismaUser.username,
    nickname: mockPrismaUser.nickname,
    socialProvider: mockPrismaUser.socialProvider,
    socialId: mockPrismaUser.socialId,
    isPrivate: mockPrismaUser.isPrivate,
    status: mockPrismaUser.status,
    firebaseUid: mockPrismaUser.firebaseUid,
    isOnboarded: mockPrismaUser.isOnboarded,
    profileImageUrl: null,
  };

  describe('POST /auth/onboard', () => {
    const onboardingData = {
      username: 'testuser',
      mbti: Mbti.INFJ,
      tags: [Tag.LATE_NIGHT_EATER],
    };
    it('성공: 유효한 온보딩 정보로 온보딩', async () => {
      (mockAuthGuard.canActivate as jest.Mock).mockImplementation(
        (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockDecodedFirebaseToken;
          return true;
        },
      );

      (authService.completeOnboarding as jest.Mock).mockResolvedValue(
        mockPrismaUser,
      );

      const res = await request(app.getHttpServer())
        .post('/auth/onboard')
        .set('Authorization', 'Bearer valid-firebase-token')
        .send(onboardingData)
        .expect(HttpStatus.CREATED);

      expect(authService.completeOnboarding).toHaveBeenCalledWith(
        mockDecodedFirebaseToken.uid,
        onboardingData,
      );

      expect(res.body).toEqual(expectedResponse);
    });

    it('실패: 유효하지 않은 온보딩 데이터', async () => {
      (mockAuthGuard.canActivate as jest.Mock).mockReturnValue(true);

      const invalidOnboardData = { nickname: '' }
      await request(app.getHttpServer())
        .post('/auth/onboard')
        .set('Authorization', 'Bearer valid-firebase-token')
        .send(invalidOnboardData)
        .expect(HttpStatus.BAD_REQUEST)
      
      expect(authService.completeOnboarding).not.toHaveBeenCalled();
    });

    it('실패: Firebase 인증 실패', async () => {
      (mockAuthGuard.canActivate as jest.Mock).mockImplementation(
        () => {
          throw new UnauthorizedException();
        },
      );
      await request(app.getHttpServer())
        .post('/auth/onboard')
        .set('Authorization', 'Bearer invalid-firebase-token')
        .send(onboardingData)
        .expect(HttpStatus.UNAUTHORIZED);
      expect(authService.completeOnboarding).not.toHaveBeenCalled();
      });

    it('실패: 서비스 에러 발생', async () => {
      (mockAuthGuard.canActivate as jest.Mock).mockImplementation(
        (context) => {
          context.switchToHttp().getRequest().user = mockDecodedFirebaseToken;
          return true;
        },
      );

      (authService.completeOnboarding as jest.Mock).mockRejectedValue(
        new Error('Service failed'),
      );
      await request(app.getHttpServer())
        .post('/auth/onboard')
        .set('Authorization', 'Bearer valid-firebase-token')
        .send(onboardingData)
        .expect(HttpStatus.BAD_REQUEST);
      
      expect(authService.completeOnboarding).toHaveBeenCalledWith(
        mockDecodedFirebaseToken.uid,
        onboardingData
      )
    });
  });

  describe('POST /auth/register', () => {
    it('성공: 유효한 정보로 회원가입', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'ValidPassword123!',
        nickname: 'newuser',
      };
      const mockServiceResponse = {
        accessToken: 'a-very-long-access-token',
        user: {
          ...mockPrismaUser,
          id: 'new-user-uuid',
          email: registerData.email,
          nickname: registerData.nickname,
          username: registerData.nickname,
          isOnboarded: false,
        },
      };

      (authService.register as jest.Mock).mockResolvedValue(
        mockServiceResponse,
      );

      const expectedResponse = {
        accessToken: mockServiceResponse.accessToken,
        user: {
          id: mockServiceResponse.user.id,
          email: mockServiceResponse.user.email,
          username: mockServiceResponse.user.username,
          nickname: mockServiceResponse.user.nickname,
          socialProvider: mockServiceResponse.user.socialProvider,
          socialId: mockServiceResponse.user.socialId,
          isPrivate: mockServiceResponse.user.isPrivate,
          status: mockServiceResponse.user.status,
          firebaseUid: mockServiceResponse.user.firebaseUid,
          isOnboarded: mockServiceResponse.user.isOnboarded,
          profileImageUrl: null,
        },
      };

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(HttpStatus.CREATED);

      expect(authService.register).toHaveBeenCalledWith(registerData);
      expect(res.body).toEqual(expectedResponse);
    });

    it('실패: 유효하지 않은 가입 데이터', async () => {
      const invalidRegisterData = {
        email: 'invalid-email',
        password: '',
        nickname: '',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidRegisterData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(authService.register).not.toHaveBeenCalled();
      expect(res.body.message).toBeInstanceOf(Array);
    });

    it('실패: 서비스 에러 발생', async () => {
      const registerData = {
        email: 'fail@example.com',
        password: 'password',
        nickname: 'failuser',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new Error('Firebase user creation failed'),
      );

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(authService.register).toHaveBeenCalledWith(registerData);
    });
  });
});
