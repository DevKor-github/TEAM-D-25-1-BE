import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchUserUseCase {
  constructor() {}

  // FIXME: I'm not pretty sure about the searchQuery works like this.
  // Maybe need cursor pagination for this
  async execute(query: string, page: number, perPage: number) {}
}
