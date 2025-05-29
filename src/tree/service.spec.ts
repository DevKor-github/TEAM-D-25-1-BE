import { Test, TestingModule } from '@nestjs/testing';
import { TreeService } from './service';
import { TreeRepository } from './repository';
import { Coordinate, PlantTreeDto } from './dto';
import { SavedRestaurant, Restaurant, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

describe('TreeService (unit)', () => {
  let service: TreeService;
  let repository: TreeRepository;
  let prisma: PrismaService;

  const mockTreeRepository = {
    getTreesByLocation: jest.fn(),
    getTreeById: jest.fn(),
    waterTree: jest.fn(),
    plantTree: jest.fn(),
    getRecommendations: jest.fn(),
    getAllFriendsTree: jest.fn(),
  };

  const mockPrismaService = {
    // PrismaService에서 사용되는 메서드들을 여기에 Mock으로 정의합니다.
    // 예: $connect: jest.fn(),
    // 예: savedRestaurant: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    // 예: restaurant: { findMany: jest.fn() },
    // 예: friend: { findMany: jest.fn() },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreeService,
        {
          provide: TreeRepository,
          useValue: mockTreeRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TreeService>(TreeService);
    repository = module.get<TreeRepository>(TreeRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTreesByLocation', () => {
    it('should call repository.getTreesByLocation with location', async () => {
      const location: Coordinate = { lat: '37.123', lon: '127.456' };
      await service.getTreesByLocation(location);
      expect(repository.getTreesByLocation).toHaveBeenCalledWith(location);
    });
  });

  describe('getTreeById', () => {
    it('should call repository.getTreeById with restaurantId and userId', async () => {
      const restaurantId = 'test-restaurant-id';
      const userId = 'test-user-id';
      await service.getTreeById(restaurantId, userId);
      expect(repository.getTreeById).toHaveBeenCalledWith(restaurantId, userId);
    });
  });

  describe('waterTree', () => {
    it('should call repository.waterTree with restaurantId and userId', async () => {
      const restaurantId = 'test-restaurant-id';
      const userId = 'test-user-id';
      await service.waterTree(restaurantId, userId);
      expect(repository.waterTree).toHaveBeenCalledWith(restaurantId, userId);
    });
  });

  describe('plantTree', () => {
    it('should call repository.plantTree with plantTreeDto and userId', async () => {
      const plantTreeDto: PlantTreeDto = { treeTypeId: 1, restaurantId: 'test-restaurant-id' };
      const userId = 'test-user-id';
      await service.plantTree(plantTreeDto, userId);
      expect(repository.plantTree).toHaveBeenCalledWith(plantTreeDto, userId);
    });
  });

  describe('getRecommendations', () => {
    it('should call repository.getRecommendations', async () => {
      await service.getRecommendations();
      expect(repository.getRecommendations).toHaveBeenCalled();
    });
  });

  describe('getAllFriendsTree', () => {
    it('should call repository.getAllFriendsTree with userId and restaurantId', async () => {
      const userId = 'test-user-id';
      const restaurantId = 'test-restaurant-id';
      await service.getAllFriendsTree(userId, restaurantId);
      expect(repository.getAllFriendsTree).toHaveBeenCalledWith(userId, restaurantId);
    });
  });
});
