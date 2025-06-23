import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchRestaurantUseCase {
  constructor() {}

  // FIXME: I'm not sure about the searchQuery work like this.
  // Maybe need cursor pagination for this
  async execute(query: string, page: number, perPage: number) {}
}
