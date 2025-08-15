import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user';
import { UpdateMbtiAndTagsDto } from '../dtos/updateProfile.dto';
import { UserParam, UpdateUserParam } from '../params/user';
import { Tag, Mbti } from '@prisma/client';

@Injectable()
export class UpdateMbtiAndTagsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, dto: UpdateMbtiAndTagsDto): Promise<UserParam> {
    const param: UpdateUserParam = {
      mbti: dto.mbti as Mbti | undefined,
      tag: dto.tags as Tag[] | undefined,
    };

    return this.userRepository.updatePartial(userId, param);
  }
}

