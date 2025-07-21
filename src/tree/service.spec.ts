import { Test, TestingModule } from '@nestjs/testing';
import { TreeService } from './service';
import { TreeRepository } from './repository';
import { PlantTreeDto, TreeDetailResponse } from './dto';
import { Tag, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TreeDetail } from './types';

const mockUserId = 'user-spicy-lover-1234';
const mockOwnerId = 'owner-jjamppong-master-5678';
const mockRestaurantId = 'restaurant-yupdduk-4321';
const mockTreeId = `${mockOwnerId}_${mockRestaurantId}`;

const mockTreeDetail: TreeDetail = {
  user: { id: mockOwnerId, isPrivate: false } as User,
  restaurant: {
    id: mockRestaurantId,
    name: '엽기떡볶이 동대문본점',
    address: '서울 중구 퇴계로75길 13',
    latitude: 37.5701,
    longitude: 127.0125,
  } as any,
  tree: {
    userId: mockOwnerId,
    restaurantId: mockRestaurantId,
    description: '스트레스 받을 땐 착한맛도 충분해요.',
    review: '역시 원조는 다르다!',
    createdAt: new Date('2025-07-16T12:00:00Z'),
    updatedAt: new Date('2025-07-16T12:00:00Z'),
    recommendedByUsers: [mockUserId],
    treeType: 4, // 단풍나무 씨앗
    tag: [Tag.SPICY_FOOD_LOVER, Tag.LATE_NIGHT_EATER],
  },
};

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
    getFollowersTree: jest.fn(),
    getTreesByRestaurantId: jest.fn(),
  };

  const mockPrismaService = {
    follower: { findMany: jest.fn(), findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    restaurant: { findUnique: jest.fn() },
    savedRestaurant: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreeService,
        { provide: TreeRepository, useValue: mockTreeRepository },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TreeService>(TreeService);
    repository = module.get<TreeRepository>(TreeRepository);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTreeById', () => {
    it('조회자가 나무 주인이면 DTO를 반환해야 함', async () => {
      jest.spyOn(repository, 'getTreeById').mockResolvedValue(mockTreeDetail);
      const result = await service.getTreeById(mockTreeId, mockOwnerId);
      expect(repository.getTreeById).toHaveBeenCalledWith(mockOwnerId, mockRestaurantId);
      expect(result).toEqual(mockTreeDetailResponse);
    });
  
    it('조회자가 ACCEPTED 상태의 팔로워이면 DTO를 반환해야 함', async () => {
      jest.spyOn(prisma.follower, 'findUnique').mockResolvedValue({ status: 'ACCEPTED' } as any);
      jest.spyOn(repository, 'getTreeById').mockResolvedValue(mockTreeDetail);
      await service.getTreeById(mockTreeId, mockUserId);
      expect(prisma.follower.findUnique).toHaveBeenCalled();
      expect(repository.getTreeById).toHaveBeenCalled();
    });
    
    it('팔로우 상태가 PENDING이면 ForbiddenException을 던져야 함', async () => {
      jest.spyOn(prisma.follower, 'findUnique').mockResolvedValue(null);
      await expect(service.getTreeById(mockTreeId, mockUserId)).rejects.toThrow(ForbiddenException);
    });
  
    it('팔로우 상태가 REJECTED이면 ForbiddenException을 던져야 함', async () => {
      jest.spyOn(prisma.follower, 'findUnique').mockResolvedValue(null);
      await expect(service.getTreeById(mockTreeId, mockUserId)).rejects.toThrow(ForbiddenException);
    });
    
    it('비공개 계정의 나무에 팔로워가 아닌 유저가 접근하면 ForbiddenException을 던져야 함', async () => {
      const privateAccountDetail = { ...mockTreeDetail, user: { ...mockTreeDetail.user, isPrivate: true }};
      jest.spyOn(repository, 'getTreeById').mockResolvedValue(privateAccountDetail);
      jest.spyOn(prisma.follower, 'findUnique').mockResolvedValue(null);
      await expect(service.getTreeById(mockTreeId, mockUserId)).rejects.toThrow(ForbiddenException);
    });
  
    it('나무를 찾을 수 없으면 NotFoundException을 던져야 함', async () => {
      jest.spyOn(repository, 'getTreeById').mockResolvedValue(null);
      await expect(service.getTreeById(mockTreeId, mockOwnerId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('waterTree', () => {
    it('성공 시, 업데이트된 DTO를 반환해야 함', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ lastWatered: new Date(0) } as any);
      jest.spyOn(repository, 'waterTree').mockResolvedValue(mockTreeDetail);

      const result = await service.waterTree(mockTreeId, mockUserId);
      expect(repository.waterTree).toHaveBeenCalledWith(mockOwnerId, mockRestaurantId, mockUserId);
      expect(result).toEqual(mockTreeDetailResponse);
    });

    it('쿨타임이 지나지 않았으면 BadRequestException을 던져야 함', async () => {
      const recentDate = new Date(Date.now() - 1000 * 60 * 60); // 1시간 전
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ lastWatered: recentDate } as any);
      await expect(service.waterTree(mockTreeId, mockUserId)).rejects.toThrow(BadRequestException);
    });

    it('자신의 나무에 물을 주려고 하면 BadRequestException을 던져야 함', async () => {
      await expect(service.waterTree(mockTreeId, mockOwnerId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('plantTree', () => {
    const plantTreeDto: PlantTreeDto = { restaurantId: mockRestaurantId } as any;

    it('성공 시, 생성된 treeId 객체를 반환해야 함', async () => {
      jest.spyOn(prisma.restaurant, 'findUnique').mockResolvedValue({} as any);
      jest.spyOn(prisma.savedRestaurant, 'findUnique').mockResolvedValue(null);
      jest.spyOn(repository, 'plantTree').mockResolvedValue({ userId: mockUserId, restaurantId: mockRestaurantId } as any);

      const result = await service.plantTree(plantTreeDto, mockUserId);
      expect(result).toEqual({ treeId: `${mockUserId}_${mockRestaurantId}` });
    });

    it('식당이 존재하지 않으면 NotFoundException을 던져야 함', async () => {
      jest.spyOn(prisma.restaurant, 'findUnique').mockResolvedValue(null);
      await expect(service.plantTree(plantTreeDto, mockUserId)).rejects.toThrow(NotFoundException);
    });

    it('이미 나무가 심겨 있으면 ConflictException을 던져야 함', async () => {
      jest.spyOn(prisma.restaurant, 'findUnique').mockResolvedValue({} as any);
      jest.spyOn(prisma.savedRestaurant, 'findUnique').mockResolvedValue({} as any);
      await expect(service.plantTree(plantTreeDto, mockUserId)).rejects.toThrow(ConflictException);
    });
  });

  describe('getFollowersTree', () => {
    it('결과가 없을 경우 빈 배열을 반환해야 함', async () => {
      jest.spyOn(repository, 'getFollowersTree').mockResolvedValue([]);
      const result = await service.getFollowersTree(mockUserId, mockRestaurantId);
      expect(result).toEqual([]);
    });
  });
});