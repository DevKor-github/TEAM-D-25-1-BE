import { Injectable } from '@nestjs/common';
import { SearchUserTagRepository } from '../repositories/searchUserTag';
import { UserRepository } from '@/user/repositories/user';
import { UserParam } from '@/user/params/user';

@Injectable()
export class SearchUserUseCase {
  constructor(
    private readonly searchUserTagRepository: SearchUserTagRepository,
    private readonly userRepository: UserRepository,
  ) {}

  // FIXME: I'm not pretty sure about the searchQuery works like this.
  // Maybe need cursor pagination for this
  async execute(
    query: string,
    page: number,
    perPage: number,
  ): Promise<UserParam[]> {
    const userIds: string[] = await this.searchUserTagRepository.getIdList(
      query,
      page,
      perPage,
    );

    // FIXME: UserParam => UserEntity
    const users: UserParam[] = await this.userRepository.findByIdList(userIds);

    return users;
  }
}
