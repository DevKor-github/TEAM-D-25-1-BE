import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user';
import { UpdateProfileDto } from '../dtos/updateProfile.dto';
import { UserParam, UpdateUserParam } from '../params/user';

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<UserParam> {
    const param: UpdateUserParam = {
      email: dto.email,
      nickname: dto.nickname,
      description: dto.description,
      isPrivate: dto.isPrivate,
      status: dto.status,
      profileImageUrl: undefined,
      password: dto.password,
    };

    Object.keys(param).forEach((k) =>
      (param as any)[k] === undefined ? delete (param as any)[k] : null,
    );

    return this.userRepository.updatePartial(userId, param);
  }
}
