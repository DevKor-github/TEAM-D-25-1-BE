import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user';
import { UpdateProfileImageDto } from '../dtos/updateProfileImage.dto';
import { UserParam } from '../params/user';

@Injectable()
export class UpdateProfileImageUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    userId: string,
    dto: UpdateProfileImageDto,
  ): Promise<UserParam> {
    const url = new URL(dto.profileImageUrl);
    const uri = url.pathname;
    return this.userRepository.updateProfileImageUrl(userId, uri);
  }
}
