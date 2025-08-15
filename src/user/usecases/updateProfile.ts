import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user';
import { UpdateProfileDto } from '../dtos/updateProfile.dto';
import { UserParam, UpdateUserParam } from '../params/user';
import { SearchUserTagRepository } from '@/search/repositories/searchUserTag';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly searchUserTagRepository: SearchUserTagRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<UserParam> {
    const param: UpdateUserParam = {
      email: dto.email,
      nickname: dto.nickname,
      description: dto.description,
      isPrivate: dto.isPrivate,
      profileImageUrl: undefined,
    };

    Object.keys(param).forEach((k) =>
      (param as any)[k] === undefined ? delete (param as any)[k] : null,
    );

    if (dto.nickname) {
      await this.searchUserTagRepository.deleteByUserId(userId);
      await this.searchUserTagRepository.create({
        userId,
        name: dto.nickname,
      });
    }

    return this.userRepository.updatePartial(userId, param);
  }
}
