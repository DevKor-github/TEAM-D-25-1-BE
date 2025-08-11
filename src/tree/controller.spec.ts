import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { TreeController } from './controller';
import { TreeService } from './service';
import { Coordinate, PlantTreeDto, TreeDetailResponse } from './dto';
import { Response } from 'express';
import { Tag } from '@prisma/client';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';

const mockUserId = 'user-spicy-lover-1234';
const mockOwnerId = 'owner-jjamppong-master-5678';
const mockRestaurantId = 'restaurant-yupdduk-4321';
const mockTreeId = `${mockOwnerId}_${mockRestaurantId}`;

const mockTreeDetailResponse: TreeDetailResponse = {
  treeId: mockTreeId,
  name: '엽기떡볶이 동대문본점',
  address: '서울 중구 퇴계로75길 13',
  latitude: '37.5701',
  longitude: '127.0125',
  treeType: 4,
  review: '역시 원조는 다르다!',
  description: '스트레스 받을 땐 착한맛도 충분해요.',
  tags: [Tag.SPICY_FOOD_LOVER, Tag.LATE_NIGHT_EATER],
  createdAt: new Date('2025-07-16T12:00:00Z'),
  updatedAt: new Date('2025-07-16T12:00:00Z'),
  recommendationCount: 1,
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
    getTreesByRestaurantId: jest.fn(),
  };

  const mockResponse: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreeController],
      providers: [{ provide: TreeService, useValue: mockTreeService }],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { id: mockUserId };
          return true;
        },
      })
      .compile();

    controller = module.get<TreeController>(TreeController);
    service = module.get<TreeService>(TreeService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /tree', () => {
    it('주변 나무 목록 조회를 위해 service.getTreesByLocation을 호출하고 DTO 배열을 응답해야 함', async () => {
      const location: Coordinate = { lat: '37.5665', lon: '126.987' };
      const zoom = 16;
      const expectedResult = [mockTreeDetailResponse];
      (service.getTreesByLocation as jest.Mock).mockResolvedValue(expectedResult);

      await controller.getTreesByLocation(location, zoom, mockUserId, mockResponse as Response);
      
      expect(service.getTreesByLocation).toHaveBeenCalledWith(mockUserId, zoom, location);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ items: expectedResult });
    });
  });

  describe('GET /tree/:treeId', () => {
    it('특정 나무 조회를 위해 service.getTreeById를 호출하고 DTO를 응답해야 함', async () => {
      (service.getTreeById as jest.Mock).mockResolvedValue(mockTreeDetailResponse);
      
      await controller.getTreeById(mockTreeId, mockUserId, mockResponse as Response);
      
      expect(service.getTreeById).toHaveBeenCalledWith(mockTreeId, mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTreeDetailResponse);
    });
  });

  describe('POST /tree/:treeId/water', () => {
    it('나무에 물주기를 위해 service.waterTree를 호출하고 업데이트된 DTO를 응답해야 함', async () => {
      (service.waterTree as jest.Mock).mockResolvedValue(mockTreeDetailResponse);
      
      await controller.waterTree(mockTreeId, mockUserId, mockResponse as Response);
      
      expect(service.waterTree).toHaveBeenCalledWith(mockTreeId, mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTreeDetailResponse);
    });
  });

  describe('POST /tree', () => {
    it('새 나무 심기를 위해 service.plantTree를 호출하고 생성된 treeId를 응답해야 함', async () => {
      const plantTreeDto: PlantTreeDto = {
        restaurantId: mockRestaurantId,
        treeType: 4,
        tags: [Tag.SPICY_FOOD_LOVER, Tag.LATE_NIGHT_EATER],
        review: '최고의 야식!',
        description: '역시 떡볶이는 엽떡이지',
      };
      const expectedResult = { treeId: `${mockUserId}_${mockRestaurantId}` };
      (service.plantTree as jest.Mock).mockResolvedValue(expectedResult);

      await controller.plantTree(plantTreeDto, mockUserId, mockResponse as Response);

      expect(service.plantTree).toHaveBeenCalledWith(plantTreeDto, mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });
});