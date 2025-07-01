import { Test, TestingModule } from '@nestjs/testing';
import { SearchRestaurantUseCase } from './searchRestaurant';
import { SearchRestaurantTagRepository } from '../repositories/searchRestaurantTag';
import { RestaurantRepository } from '@/restaurant/repositories/restaurant';
import { RestaurantEntity } from '@/restaurant/entity';

describe('SearchRestaurantUseCase', () => {
  let useCase: SearchRestaurantUseCase;
  let searchRestaurantRepository: jest.Mocked<SearchRestaurantTagRepository>;
  let restaurantRepository: jest.Mocked<RestaurantRepository>;

  const mockRestaurantEntity: RestaurantEntity = {
    id: 'restaurant-1',
    placeId: 'place-1',
    name: '테스트 레스토랑',
    address: '서울시 강남구',
    latitude: '37.5665',
    longitude: '126.9780',
    createdAt: new Date('2024-01-01'),
  };

  const mockRestaurantEntity2: RestaurantEntity = {
    id: 'restaurant-2',
    placeId: 'place-2',
    name: '테스트 레스토랑 2',
    address: '서울시 서초구',
    latitude: '37.5665',
    longitude: '126.9780',
    createdAt: new Date('2024-01-02'),
  };

  beforeEach(async () => {
    const mockSearchRestaurantRepository = {
      getIdList: jest.fn(),
    };

    const mockRestaurantRepository = {
      getRestaurantsByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchRestaurantUseCase,
        {
          provide: SearchRestaurantTagRepository,
          useValue: mockSearchRestaurantRepository,
        },
        {
          provide: RestaurantRepository,
          useValue: mockRestaurantRepository,
        },
      ],
    }).compile();

    useCase = module.get<SearchRestaurantUseCase>(SearchRestaurantUseCase);
    searchRestaurantRepository = module.get(SearchRestaurantTagRepository);
    restaurantRepository = module.get(RestaurantRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return restaurant list with search query and pagination parameters', async () => {
      // Given
      const query = '테스트';
      const page = 1;
      const perPage = 10;
      const mockRestaurantIds = ['restaurant-1', 'restaurant-2'];
      const mockRestaurants = [mockRestaurantEntity, mockRestaurantEntity2];

      searchRestaurantRepository.getIdList.mockResolvedValue(mockRestaurantIds);
      restaurantRepository.getRestaurantsByIds.mockResolvedValue(
        mockRestaurants,
      );

      // When
      const result = await useCase.execute(query, page, perPage);

      // Then
      expect(searchRestaurantRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(restaurantRepository.getRestaurantsByIds).toHaveBeenCalledWith(
        mockRestaurantIds,
      );
      expect(result).toEqual(mockRestaurants);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no search results found', async () => {
      // Given
      const query = '존재하지 않는 레스토랑';
      const page = 1;
      const perPage = 10;
      const mockRestaurantIds: string[] = [];

      searchRestaurantRepository.getIdList.mockResolvedValue(mockRestaurantIds);
      restaurantRepository.getRestaurantsByIds.mockResolvedValue([]);

      // When
      const result = await useCase.execute(query, page, perPage);

      // Then
      expect(searchRestaurantRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(restaurantRepository.getRestaurantsByIds).toHaveBeenCalledWith(
        mockRestaurantIds,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should pass pagination parameters correctly', async () => {
      // Given
      const query = '테스트';
      const page = 2;
      const perPage = 5;
      const mockRestaurantIds = ['restaurant-1'];

      searchRestaurantRepository.getIdList.mockResolvedValue(mockRestaurantIds);
      restaurantRepository.getRestaurantsByIds.mockResolvedValue([
        mockRestaurantEntity,
      ]);

      // When
      await useCase.execute(query, page, perPage);

      // Then
      expect(searchRestaurantRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
    });

    it('should be able to search with empty query', async () => {
      // Given
      const query = '';
      const page = 1;
      const perPage = 10;
      const mockRestaurantIds = ['restaurant-1'];

      searchRestaurantRepository.getIdList.mockResolvedValue(mockRestaurantIds);
      restaurantRepository.getRestaurantsByIds.mockResolvedValue([
        mockRestaurantEntity,
      ]);

      // When
      const result = await useCase.execute(query, page, perPage);

      // Then
      expect(searchRestaurantRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(result).toEqual([mockRestaurantEntity]);
    });

    it('should maintain correct order of search results', async () => {
      // Given
      const query = '테스트';
      const page = 1;
      const perPage = 10;
      const mockRestaurantIds = ['restaurant-2', 'restaurant-1']; // 순서가 바뀐 ID 목록
      const mockRestaurants = [mockRestaurantEntity2, mockRestaurantEntity]; // 순서가 바뀐 결과

      searchRestaurantRepository.getIdList.mockResolvedValue(mockRestaurantIds);
      restaurantRepository.getRestaurantsByIds.mockResolvedValue(
        mockRestaurants,
      );

      // When
      const result = await useCase.execute(query, page, perPage);

      // Then
      expect(restaurantRepository.getRestaurantsByIds).toHaveBeenCalledWith(
        mockRestaurantIds,
      );
      expect(result).toEqual(mockRestaurants);
      expect(result[0].id).toBe('restaurant-2');
      expect(result[1].id).toBe('restaurant-1');
    });

    it('should propagate error when repository throws an error', async () => {
      // Given
      const query = '테스트';
      const page = 1;
      const perPage = 10;
      const mockError = new Error('Database connection failed');

      searchRestaurantRepository.getIdList.mockRejectedValue(mockError);

      // When & Then
      await expect(useCase.execute(query, page, perPage)).rejects.toThrow(
        'Database connection failed',
      );
      expect(searchRestaurantRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(restaurantRepository.getRestaurantsByIds).not.toHaveBeenCalled();
    });

    it('should propagate error when RestaurantRepository throws an error', async () => {
      // Given
      const query = '테스트';
      const page = 1;
      const perPage = 10;
      const mockRestaurantIds = ['restaurant-1'];
      const mockError = new Error('Restaurant not found');

      searchRestaurantRepository.getIdList.mockResolvedValue(mockRestaurantIds);
      restaurantRepository.getRestaurantsByIds.mockRejectedValue(mockError);

      // When & Then
      await expect(useCase.execute(query, page, perPage)).rejects.toThrow(
        'Restaurant not found',
      );
      expect(searchRestaurantRepository.getIdList).toHaveBeenCalledWith(
        query,
        page,
        perPage,
      );
      expect(restaurantRepository.getRestaurantsByIds).toHaveBeenCalledWith(
        mockRestaurantIds,
      );
    });
  });
});
