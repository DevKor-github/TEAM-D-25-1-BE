import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { AuthService } from './service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthController } from './controller';
import { FirebaseAuthStrategy } from './strategies/firebase.strategy';
import * as admin from 'firebase-admin';
import { CanActivate } from '@nestjs/common';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    applicationDefault: jest.fn(),
    cert: jest.fn(),
  },
  auth: () => ({
    verifyIdToken: jest.fn(),
  }),
}));

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;
  let firebaseAdminAuth: any;
  let mockFirebaseAuthGuard: CanActivate;

  beforeEach(async () => {
    firebaseAdminAuth = admin.auth();
    jest.spyOn(admin, 'auth').mockReturnValue(firebaseAdminAuth);

    mockFirebaseAuthGuard = { canActivate: jest.fn() };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {
          completeOnboarding: jest.fn(),
          register: jest.fn(),
          validateUser: jest.fn(),
        } },
      ],
    })
    .overrideGuard(FirebaseAuthGuard)
    .useValue(mockFirebaseAuthGuard)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    authService = moduleFixture.get<AuthService>(AuthService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/onboard', () => {
    it('성공: 유효한 온보딩 정보로 온보딩', async () => {
      const onboardingData = { nickname: 'testuser' };
      const expectedResult = { id: 'user-id', nickname: 'testuser', isOnboarded: true };
      (mockFirebaseAuthGuard.canActivate as jest.Mock).mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { uid: 'mockFirebaseUid', email: 'test@example.com' };
        return true;
      });

      (authService.completeOnboarding as jest.Mock).mockResolvedValue(expectedResult);

      const res = await request(app.getHttpServer())
        .post('/auth/onboard')
        .set('Authorization', 'Bearer valid-firebase-token')
        .send(onboardingData)
        .expect(HttpStatus.CREATED);

      expect(authService.completeOnboarding).toHaveBeenCalledWith('mockFirebaseUid', onboardingData);
      expect(res.body).toEqual(expectedResult);
    });

    it('실패: 유효하지 않은 온보딩 데이터', async () => {
      (mockFirebaseAuthGuard.canActivate as jest.Mock).mockImplementation((context) => {
         const req = context.switchToHttp().getRequest();
         req.user = { uid: 'mockFirebaseUid', email: 'test@example.com' };
         return true;
      });

      const invalidOnboardData = { nickname: '' };
      const res = await request(app.getHttpServer())
        .post('/auth/onboard')
        .set('Authorization', 'Bearer valid-firebase-token')
        .send(invalidOnboardData)
        .expect(HttpStatus.BAD_REQUEST);
      expect(authService.completeOnboarding).not.toHaveBeenCalled();
      expect(res.body.message).toBeInstanceOf(Array);
    });

    it('실패: Firebase 인증 실패', async () => {
        (mockFirebaseAuthGuard.canActivate as jest.Mock).mockImplementation(() => {
             throw new UnauthorizedException();
        });

        const onboardingData = { nickname: 'testuser' };
        const res = await request(app.getHttpServer())
            .post('/auth/onboard')
            .set('Authorization', 'Bearer invalid-token')
            .send(onboardingData)
            .expect(HttpStatus.UNAUTHORIZED);
        expect(authService.completeOnboarding).not.toHaveBeenCalled();
    });

    it('실패: 서비스 에러 발생', async () => {
      const onboardingData = { nickname: 'testuser' };
      (mockFirebaseAuthGuard.canActivate as jest.Mock).mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { uid: 'mockFirebaseUid', email: 'test@example.com' };
        return true;
      });

      (authService.completeOnboarding as jest.Mock).mockRejectedValue(new Error('Service failed'));
      const res = await request(app.getHttpServer())
        .post('/auth/onboard')
        .set('Authorization', 'Bearer valid-firebase-token')
        .send(onboardingData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(authService.completeOnboarding).toHaveBeenCalledWith('mockFirebaseUid', onboardingData);
    });

  });

  describe('POST /auth/register', () => {

    it('성공: 유효한 정보로 회원가입', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'newpassword',
        nickname: 'newuser',
      };
      const expectedServiceResult = { uid: 'firebase-uid-new', email: 'newuser@example.com' };

      (authService.register as jest.Mock).mockResolvedValue(expectedServiceResult);

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(HttpStatus.CREATED);

      expect(authService.register).toHaveBeenCalledWith(registerData);
      expect(res.body).toEqual(expectedServiceResult);
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

      (authService.register as jest.Mock).mockRejectedValue(new Error('Firebase user creation failed'));

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(authService.register).toHaveBeenCalledWith(registerData);
    });

  });

}); 