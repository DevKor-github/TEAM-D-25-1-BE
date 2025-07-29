import { UpdateFcmTokenUseCase } from './updateFcmToken';
import { UserRepository } from '../repositories/user';
import { UpdateFcmTokenParam, UserParam } from '../params/user';

describe('UpdateFcmTokenUseCase', () => {
  let useCase: UpdateFcmTokenUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      updateFcmToken: jest.fn(),
    } as any;
    useCase = new UpdateFcmTokenUseCase(userRepository);
  });

  it('should update fcmToken and return updated user', async () => {
    const userId = 'test-user-id';
    const param: UpdateFcmTokenParam = { fcmToken: 'new-fcm-token' };
    const expectedUser: UserParam = {
      id: userId,
      firebaseUid: 'firebase-uid-1234',
      email: 'test@example.com',
      username: 'testuser',
      nickname: 'nickname',
      password: 'hashed',
      socialProvider: 'GOOGLE',
      socialId: 'social-id',
      isPrivate: false,
      createdAt: new Date(),
      profileImageUrl: null,
      fcmToken: 'new-fcm-token',
      fcmTokenUpdatedAt: new Date(),
    };
    userRepository.updateFcmToken.mockResolvedValue(expectedUser);

    const result = await useCase.execute(userId, param);
    expect(userRepository.updateFcmToken).toHaveBeenCalledWith(userId, param);
    expect(result).toEqual(expectedUser);
  });
});
