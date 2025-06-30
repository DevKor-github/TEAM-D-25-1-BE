import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { TreeController } from './controller';
import { TreeService } from './service';
import { Coordinate, TreeIdDto, WaterTreeDto, PlantTreeDto, TreeDetailResponse } from './dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { Response } from 'express';

const mockUserId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
const mockRestaurantId = 'f0e9d8c7-b6a5-4321-fedc-ba9876543210';

const mockTreeDetailResponse: TreeDetailResponse = {
    name: '톤쇼우 부산대본점',
    address: '부산 금정구 금강로 247-10',
    latitude: '35.230402',
    longitude: '129.084294',
    treeType: 2,
    review: '맛있어요~',
    description: '버크셔K 특로스시켜야함',
    tagIds: [1, 3, 5],
    createdAt: new Date('2025-06-17T12:34:56.000Z'),
    updatedAt: new Date('2025-06-18T08:22:10.000Z'),
    recommendedUsers: ['user-uuid-1', 'user-uuid-2'],
};

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

  const mockResponse: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }

  beforeEach(async() => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreeController],
      providers: [
        { provide: TreeService, useValue: mockTreeService },
        {
          provide: FirebaseAuthGuard,
          useValue: jest.fn().mockImplementation(() => true)
        }
      ]
    })
    .overrideGuard(FirebaseAuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        request.user = { uid: mockUserId };
        return true;
      },
    })
    .compile()

    controller = module.get<TreeController>(TreeController);
    service = module.get<TreeService>(TreeService);
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /tree', () => {
    it('주변 나무 목록 조회를 위해 service.getTreesByLocation을 호출하고 Response 객체로 응답해야 함', async () => {
      const location: Coordinate = { lat: '37.5665', lon: '126.987' };
      const zoom = 16;
      const expectedRes = { items: [mockTreeDetailResponse] };
      (service.getTreesByLocation as jest.Mock).mockResolvedValue(expectedRes);

      await controller.getTreesByLocation(location, zoom, mockUserId, mockResponse as Response)
      expect(service.getTreesByLocation).toHaveBeenCalledWith(mockUserId, zoom, location);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedRes);

    });
  });

  describe('GET /tree/:treeId', () => {
    it('특정 나무 조회를 위해 service.getTreeById를 호출하고 Response 객체로 응답해야 함', async () => {
      (service.getTreeById as jest.Mock).mockResolvedValue(mockTreeDetailResponse);
      await controller.getTreeById(mockRestaurantId, mockUserId, mockResponse as Response);
      expect(service.getTreeById).toHaveBeenCalledWith(mockRestaurantId, mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTreeDetailResponse);
    });
  });

  describe('POST /tree/:treeId/water', () => {
    it('나무에 물주기를 위해 service.waterTree를 호출하고 Response 객체로 응답해야 함', async () => {
      const expectedResult = { 
        ...mockTreeDetailResponse, 
        recommendedUsers: [
          ...mockTreeDetailResponse.recommendedUsers, 
          mockUserId
        ] 
      };
      await controller.waterTree(mockRestaurantId, mockUserId, mockResponse as Response);
      expect(service.waterTree).toHaveBeenCalledWith(mockRestaurantId, mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('POST /tree', () => {
    it('새 나무 심기를 위해 service.plantTree를 호출하고 Response 객체로 응답해야 함', async () => {
      const plantTreeDto: PlantTreeDto = { 
        restaurantId: mockRestaurantId, 
        treeTypeId: 1, 
        tagIds: [1], 
        review: '새 리뷰', 
        description: '새 설명' 
      };
      const expectedResult = { ...mockTreeDetailResponse, review: '새 리뷰' };
      (service.plantTree as jest.Mock).mockResolvedValue(expectedResult);

      await controller.plantTree(plantTreeDto, mockUserId, mockResponse as Response);

      expect(service.plantTree).toHaveBeenCalledWith(plantTreeDto, mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('POST /tree/recommendations', () => {
    it('추천 나무 조회를 위해 service.getRecommendations를 호출하고 Response 객체로 응답해야 함', async () => {
      const expectedResult = { items: [] };
      (service.getRecommendations as jest.Mock).mockResolvedValue(expectedResult);

      await controller.getRecommendations(mockResponse as Response);

      expect(service.getRecommendations).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('GET /tree/followers', () => {
    it('팔로워 나무 조회를 위해 service.getFollowersTree를 호출하고 Response 객체로 응답해야 함', async () => {
      const expectedResult = { items: [mockTreeDetailResponse] };
      (service.getFollowersTree as jest.Mock).mockResolvedValue(expectedResult);

      await controller.getFollowers(mockRestaurantId, mockUserId, mockResponse as Response);

      expect(service.getFollowersTree).toHaveBeenCalledWith(mockUserId, mockRestaurantId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });
});
