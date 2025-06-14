import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { TreeController } from './controller';
import { TreeService } from './service';
import { Coordinate, TreeIdDto, WaterTreeDto, PlantTreeDto } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

describe('TreeController (unit)', () => {
  let controller: TreeController;
  let service: TreeService;

  const mockTreeService = {
    getTreesByLocation: jest.fn(),
    getTreeById: jest.fn(),
    waterTree: jest.fn(),
    plantTree: jest.fn(),
    getRecommendations: jest.fn(),
    getFollowersTree: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn(() => mockResponse),
    json: jest.fn((x) => x),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreeController],
      providers: [TreeService],
    })
      .overrideProvider(TreeService)
      .useValue(mockTreeService)
      .overrideGuard(FirebaseAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<TreeController>(TreeController);
    service = module.get<TreeService>(TreeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /tree', () => {
    it('should call getTreesByLocation service method', async () => {
      const location: Coordinate = { lat: '37.123', lon: '127.456' };
      await controller.getTreesByLocation(location, mockResponse as any);
      expect(service.getTreesByLocation).toHaveBeenCalledWith(location);
    });
  });

  describe('GET /tree/:treeId', () => {
    it('should call getTreeById service method with treeId and userId', async () => {
      const treeId = 'test-tree-id'; // RestaurantId
      const userId = 'test-user-id';
      await controller.getTreeById(treeId, userId, mockResponse as any);
      expect(service.getTreeById).toHaveBeenCalledWith(treeId, userId);
    });
  });

  describe('POST /tree/:treeId/water', () => {
    it('should call waterTree service method with treeId and userId', async () => {
      const treeId = 'test-tree-id'; // RestaurantId
      const userId = 'test-user-id';
      await controller.waterTree(treeId, userId, mockResponse as any);
      expect(service.waterTree).toHaveBeenCalledWith(treeId, userId);
    });
  });

  describe('POST /tree', () => {
    it('should call plantTree service method with plantTreeDto and userId', async () => {
      const plantTreeDto: PlantTreeDto = {
        treeTypeId: 1,
        restaurantId: 'test-restaurant-id',
        tagIds: [],
        review: 'test-review',
        description: 'test-description',
      };
      const userId = 'test-user-id';
      await controller.plantTree(plantTreeDto, userId, mockResponse as any);
      expect(service.plantTree).toHaveBeenCalledWith(plantTreeDto, userId);
    });
  });

  describe('POST /tree/recommendations', () => {
    it('should call getRecommendations service method', async () => {
      await controller.getRecommendations(mockResponse as any);
      expect(service.getRecommendations).toHaveBeenCalled();
    });
  });

  describe('GET /tree/followers', () => {
    it('should call getFollowersTree service method with userId and restaurantId', async () => {
      const userId = 'test-user-id';
      const restaurantId = 'test-restaurant-id';
      await controller.getFollowers(restaurantId, userId, mockResponse as any);
      expect(service.getFollowersTree).toHaveBeenCalledWith(userId, restaurantId);
    });
  });
});
