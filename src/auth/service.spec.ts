import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './service';
import { FirebaseAuthStrategy } from './strategies/firebase.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    applicationDefault: jest.fn(),
    cert: jest.fn(),
  },
  auth: () => ({
    createUser: jest.fn(),
  }),
}));

describe('AuthService (Refactor)', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let firebaseAuth: any;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.mock('firebase-admin', () => ({
      apps: { length: 1 },
      credential: {
        applicationDefault: jest.fn(),
      },
      auth: jest.fn().mockReturnThis(),
    }));

    const mockFirebaseAuth = {
      createUser: jest.fn(),
    };

    jest.spyOn(admin, 'auth').mockReturnValue(mockFirebaseAuth as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    firebaseAuth = mockFirebaseAuth as any;

    mockPrismaService.user.findUnique.mockReset();
    mockPrismaService.user.create.mockReset();
    mockPrismaService.user.update.mockReset();

    mockFirebaseAuth.createUser.mockImplementation((auth: any) => {
      if (auth && auth.email === 'test@example.com') {
        // 성공 케이스
        return Promise.resolve({
          uid: 'uid-for-success',
          email: auth.email,
          displayName: auth.displayName,
        } as admin.auth.UserRecord);
      }
      if (auth && auth.email === 'a@b.com') {
        // Firebase 실패 케이스
        return Promise.reject(new Error('Firebase error'));
      }
      if (auth && auth.email === 'b@c.com') {
        // DB 실패 케이스 (Firebase는 성공해야 함)
        return Promise.resolve({
          uid: 'uid-for-db-fail',
          email: auth.email,
          displayName: auth.displayName,
        } as admin.auth.UserRecord);
      }
      // 기본 실패 케이스
      return Promise.reject(new Error('Unexpected Firebase createUser error'));
    });
  });

  it('성공: 유효한 정보로 회원가입', async () => {
    jest.spyOn(prisma.user, 'create').mockResolvedValue({
      id: 1,
      firebaseUid: 'uid-for-success',
      email: 'test@example.com',
      nickname: 'tester',
      username: 'user_uid-for-',
      isOnboarded: false,
    } as any);

    const result = await service.register({
      email: 'test@example.com',
      password: 'pass123',
      nickname: 'tester',
    });

    expect(firebaseAuth.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        password: 'pass123',
        displayName: 'tester',
      }),
    );
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        firebaseUid: 'uid-for-success',
        email: 'test@example.com',
        nickname: 'tester',
        username: 'user_uid-for-',
        isOnboarded: false,
      },
    });
    expect(result).toEqual({
      uid: 'uid-for-success',
      email: 'test@example.com',
    });
  });

  it('에러: Firebase createUser 실패', async () => {
    await expect(
      service.register({ email: 'a@b.com', password: 'x', nickname: 'n' }),
    ).rejects.toThrow('회원가입 실패: Firebase error');
    expect(firebaseAuth.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'a@b.com',
        password: 'x',
        displayName: 'n',
      }),
    );
  });

  it('에러: Prisma user.create 실패', async () => {
    jest.spyOn(prisma.user, 'create').mockRejectedValue(new Error('DB error'));

    await expect(
      service.register({ email: 'b@c.com', password: 'y', nickname: 'm' }),
    ).rejects.toThrow('회원가입 실패: DB error');
    expect(firebaseAuth.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'b@c.com',
        password: 'y',
        displayName: 'm',
      }),
    );
  });

  it('성공: 유효한 firebaseUid로 유저를 찾음', async () => {
    const fakeDecodedUser = { uid: 'valid-uid' };
    const fakeUser = {
      id: 1,
      firebaseUid: 'valid-uid',
      email: 'user@example.com',
    };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(fakeUser as any);

    const result = await service.validateUser(fakeDecodedUser as any);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'valid-uid' },
    });
    expect(result).toEqual(fakeUser);
  });

  it('에러: 존재하지 않는 firebaseUid', async () => {
    const fakeDecodedUser = { uid: 'non-existent-uid' };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    await expect(service.validateUser(fakeDecodedUser as any)).rejects.toThrow(
      '가입되지 않은 회원',
    );
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'non-existent-uid' },
    });
  });

  it('성공: 유효한 온보딩 정보 입력 시 사용자 정보 업데이트 및 isOnboarded를 true로 설정', async () => {
    const userId = 'user-id-123';
    const onboardingData = { username: 'new nickname' };
    const fakeUpdatedUser = {
      id: userId,
      username: 'new nickname',
      isOnboarded: true,
    };

    jest.spyOn(prisma.user, 'update').mockResolvedValue(fakeUpdatedUser as any);

    const result = await service.completeOnboarding(userId, onboardingData);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { ...onboardingData, isOnboarded: true },
    });
    expect(result).toEqual(fakeUpdatedUser);
  });

  it('에러: 존재하지 않는 사용자 ID로 온보딩 시도', async () => {
    const userId = 'non-existent-user';
    const onboardingData = { username: 'new nickname' };

    jest
      .spyOn(prisma.user, 'update')
      .mockRejectedValue(new Error('User not found'));

    await expect(
      service.completeOnboarding(userId, onboardingData),
    ).rejects.toThrow();

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { ...onboardingData, isOnboarded: true },
    });
  });

  // 유효하지 않은 온보딩 데이터 (DTO 유효성)
  // TODO: DTO 유효성 검사 로직 구현 후 테스트 추가
});
