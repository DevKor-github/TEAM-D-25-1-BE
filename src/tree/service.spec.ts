import { Test, TestingModule } from '@nestjs/testing';
import { TreeService } from './service';
import { TreeRepository } from './repository';
import { Coordinate, PlantTreeDto } from './dto';
import { SavedRestaurant, Restaurant, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('TreeService (unit)', () => {
  let service: TreeService;
  let repository: TreeRepository;
  let prisma: PrismaService;

  let mockTreeRepository;
  let mockPrismaService;

  beforeEach(async () => {
    mockTreeRepository = {
      getTreesByLocation: jest.fn(),
      getTreeById: jest.fn(),
      waterTree: jest.fn(),
      plantTree: jest.fn(),
      getRecommendations: jest.fn(),
      getFollowersTree: jest.fn(),
    };

    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
      restaurant: {
        findUnique: jest.fn(),
      },
      tag: {
        count: jest.fn(),
      },
    };

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
    it('should throw BadRequestException if watered too recently', async () => {
      const restaurantId = 'test-restaurant-id';
      const userId = 'test-user-id';

      const fourHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago

      mockPrismaService.user.findUnique.mockResolvedValue({ lastWatered: fourHoursAgo });

      await expect(service.waterTree(restaurantId, userId)).rejects.toThrow(
        new BadRequestException({
          message: '아직 물을 줄 수 없습니다.',
          lastWatered: fourHoursAgo,
        }),
      );
    });

    it('should call repository.waterTree with restaurantId and userId on success', async () => {
      const restaurantId = 'test-restaurant-id';
      const userId = 'test-user-id';

      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000); // 5 hours ago

      mockPrismaService.user.findUnique.mockResolvedValue({ lastWatered: fiveHoursAgo });
      mockTreeRepository.waterTree.mockResolvedValueOnce({ success: true });

      await service.waterTree(restaurantId, userId);
      expect(repository.waterTree).toHaveBeenCalledWith(restaurantId, userId);
    });
  });

  describe('plantTree', () => {
    it('should throw BadRequestException if restaurant does not exist', async () => {
      const plantTreeDto: PlantTreeDto = {
        treeTypeId: 1,
        restaurantId: 'non-existent-restaurant-id',
        tagIds: [],
        review: 'test-review',
        description: 'test-description',
      };
      const userId = 'test-user-id';

      mockPrismaService.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.plantTree(plantTreeDto, userId)).rejects.toThrow(
        new BadRequestException(`Id: ${plantTreeDto.restaurantId}에 해당하는 식당을 찾을 수 없습니다.`),
      );
    });

    it('should throw BadRequestException if tagIds contain duplicates', async () => {
      const plantTreeDto: PlantTreeDto = {
        treeTypeId: 1,
        restaurantId: 'test-restaurant-id',
        tagIds: [1, 2, 2],
        review: 'test-review',
        description: 'test-description',
      };
      const userId = 'test-user-id';

      mockPrismaService.restaurant.findUnique.mockResolvedValue({ id: plantTreeDto.restaurantId });

      await expect(service.plantTree(plantTreeDto, userId)).rejects.toThrow(
        new BadRequestException('중복된 태그가 존재합니다'),
      );
    });

    it('should throw BadRequestException if tagIds contain invalid tags', async () => {
      const plantTreeDto: PlantTreeDto = {
        treeTypeId: 1,
        restaurantId: 'test-restaurant-id',
        tagIds: [1, 999], // 999 is an invalid tag
        review: 'test-review',
        description: 'test-description',
      };
      const userId = 'test-user-id';

      mockPrismaService.restaurant.findUnique.mockResolvedValue({ id: plantTreeDto.restaurantId });
      mockPrismaService.tag.count.mockResolvedValue(1); // Only 1 valid tag out of 2

      await expect(service.plantTree(plantTreeDto, userId)).rejects.toThrow(
        new BadRequestException('사용할 수 없는 태그가 존재합니다.'),
      );
    });

    it('should call repository.plantTree with plantTreeDto and userId on success', async () => {
      const plantTreeDto: PlantTreeDto = {
        treeTypeId: 1,
        restaurantId: 'test-restaurant-id',
        tagIds: [1, 2],
        review: 'test-review',
        description: 'test-description',
      };
      const userId = 'test-user-id';

      mockPrismaService.restaurant.findUnique.mockResolvedValue({ id: plantTreeDto.restaurantId });
      mockPrismaService.tag.count.mockResolvedValue(plantTreeDto.tagIds.length);
      mockTreeRepository.plantTree.mockResolvedValueOnce({ success: true });

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

  describe('getFollowersTree', () => {
    it('should call repository.getFollowersTree with userId and restaurantId', async () => {
      const userId = 'test-user-id';
      const restaurantId = 'test-restaurant-id';
      await service.getFollowersTree(userId, restaurantId);
      expect(repository.getFollowersTree).toHaveBeenCalledWith(userId, restaurantId);
    });
  });
});
