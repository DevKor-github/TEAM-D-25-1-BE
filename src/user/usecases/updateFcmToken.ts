import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user';
import { UpdateFcmTokenParam, UserParam } from '../params/user';

@Injectable()
export class UpdateFcmTokenUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    userId: string,
    param: UpdateFcmTokenParam,
  ): Promise<UserParam> {
    return this.userRepository.updateFcmToken(userId, param);
  }
}
