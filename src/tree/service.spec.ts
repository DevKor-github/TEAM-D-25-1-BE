import { Test, TestingModule } from '@nestjs/testing';
import { TreeService } from './service';
import { TreeRepository } from './repository';
import { Coordinate, PlantTreeDto } from './dto';
import { SavedRestaurant, Restaurant, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const mockUserId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
const mockOwnerId = 'owner-uuid-5678';
const mockOtherUserId = 'other-user-uuid-abcd';
const mockRestaurantId = 'f0e9d8c7-b6a5-4321-fedc-ba9876543210';
const mockNestedId = `${mockOwnerId}_${mockRestaurantId}`;

const mockRestaurant: Restaurant = {
  id: mockRestaurantId,
  placeId: 'place-123',
  name: '톤쇼우 부산대본점',
  address: '부산 금정구 금강로 247-10',
  latitude: 35.230402,
  longitude: 129.084294,
  createdAt: new Date(),
};

const mockUser: User = {
  id: mockUserId,
  email: 'test@test.com',
  username: 'testuser',
  nickname: '테스트유저',
  password: 'hashedpassword',
  socialProvider: null,
  socialId: null,
  isPrivate: false,
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  firebaseUid: 'firebase-uid-1',
  isOnboarded: true,
  profileImageUrl: null,
  lastWatered: null,
};

const mockSavedRestaurant: SavedRestaurant = {
  userId: mockUserId,
  restaurantId: mockRestaurantId,
  description: '버크셔K 특로스시켜야함',
  review: '맛있어요~',
  createdAt: new Date(),
  updatedAt: new Date(),
  recommendedByUsers: [],
  treeType: 2,
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
    tag: { count: jest.fn() },
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

  describe('getTreesByLocation', () => {
    it('should call repository.getTreesByLocation and return its result', async () => {
      const location: Coordinate = { lat: '37.123', lon: '127.456' };
      const zoom = 16;
      const expectedRes = [mockRestaurant];
      (repository.getTreesByLocation as jest.Mock).mockResolvedValue(
        expectedRes,
      );

      const res = await service.getTreesByLocation(mockUserId, zoom, location);

      expect(repository.getTreesByLocation).toHaveBeenCalledWith(
        mockUserId,
        zoom,
        location,
      );
      expect(res).toEqual(expectedRes);
    });
  });

  describe('getTreeById', () => {
    it('잘못된 형식의 nestedId가 들어오면 BadRequestException을 던져야 함', async () => {
      const invalidId = 'invalid-id-format';
      await expect(service.getTreeById(invalidId, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('조회자가 나무 주인이면 권한 확인 후 repository.getTreeById를 호출해야 함', async () => {
      (repository.getTreeById as jest.Mock).mockResolvedValue(
        mockSavedRestaurant,
      );

      await service.getTreeById(mockNestedId, mockOwnerId); // 조회자(viewer)가 주인(owner)

      expect(repository.getTreeById).toHaveBeenCalledWith(
        mockOwnerId,
        mockRestaurantId,
      );
    });

    it('조회자가 나무 주인의 팔로워이면 권한 확인 후 repository.getTreeById를 호출해야 함', async () => {
      (prisma.follower.findUnique as jest.Mock).mockResolvedValue({
        status: 'ACCEPTED',
      });
      (repository.getTreeById as jest.Mock).mockResolvedValue(
        mockSavedRestaurant,
      );

      await service.getTreeById(mockNestedId, mockUserId);

      expect(prisma.follower.findUnique).toHaveBeenCalled();
      expect(repository.getTreeById).toHaveBeenCalledWith(
        mockOwnerId,
        mockRestaurantId,
      );
    });

    it('조회자가 팔로워가 아니면 ForbiddenException을 던져야 함', async () => {
      (prisma.follower.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getTreeById(mockNestedId, mockOtherUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('권한 확인 후 나무를 찾을 수 없으면 NotFoundException을 던져야 함', async () => {
      (repository.getTreeById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getTreeById(mockNestedId, mockOwnerId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTreesByRestaurantId', () => {
    it('본인과 팔로워의 ID 목록으로 repository.getTreesByRestaurantId를 호출해야 함', async () => {
      const mockFollowings = [
        { userId: 'follower-1' },
        { userId: 'follower-2' },
      ];
      const expectedUserIds = ['follower-1', 'follower-2', mockUserId];
      (prisma.follower.findMany as jest.Mock).mockResolvedValue(mockFollowings);
      (repository.getTreesByRestaurantId as jest.Mock).mockResolvedValue([]);

      await service.getTreesByRestaurantId(mockRestaurantId, mockUserId);

      expect(prisma.follower.findMany).toHaveBeenCalledWith({
        where: { followerId: mockUserId, status: 'ACCEPTED' },
        select: { userId: true },
      });
      expect(repository.getTreesByRestaurantId).toHaveBeenCalledWith(
        mockRestaurantId,
        expect.arrayContaining(expectedUserIds),
      );
    });
  });

  describe('waterTree', () => {
    it('lastWatered가 null이면 repository.waterTree를 호출해야 함', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await service.waterTree(mockRestaurantId, mockUserId);

      expect(repository.waterTree).toHaveBeenCalledWith(
        mockRestaurantId,
        mockUserId,
      );
    });

    it('lastWatered가 메서드 호출 시각으로부터 4시간 이내이면 BadRequestException을 던져야 함', async () => {
      const lastWatered = new Date(Date.now() - 3 * 60 * 60 * 1000);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ lastWatered });
      const expectedError = new BadRequestException({
        message: '아직 물을 줄 수 없습니다.',
        lastWatered,
      });
      await expect(
        service.waterTree(mockRestaurantId, mockUserId),
      ).rejects.toThrow(expectedError);
    });

    it('물을 줄 수 있는 경우 repository.waterTree를 호출하고 결과를 반환해야 함', async () => {
      const lastWatered = new Date(Date.now() - 5 * 60 * 60 * 1000);
      const expectedResult = {
        ...mockSavedRestaurant,
        recommendedByUsers: [mockUserId],
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ lastWatered });
      (repository.waterTree as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.waterTree(mockRestaurantId, mockUserId);

      expect(repository.waterTree).toHaveBeenCalledWith(
        mockRestaurantId,
        mockUserId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('plantTree', () => {
    it('should throw BadRequestException if restaurant does not exist', async () => {
      const plantTreeDto: PlantTreeDto = {
        treeTypeId: 1,
        restaurantId: mockRestaurantId,
        tagIds: [1, 2],
        review: 'test-review',
        description: 'test-description',
      };
      it('존재하지 않는 식당 ID일 경우 BadRequestException을 던져야 함', async () => {
        (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(
          service.plantTree(plantTreeDto, mockUserId),
        ).rejects.toThrow(
          new BadRequestException(
            `Id: ${plantTreeDto.restaurantId}에 해당하는 식당을 찾을 수 없습니다.`,
          ),
        );
      });

      it('중복된 태그가 있을 경우 BadRequestException을 던져야 함', async () => {
        const dtoWithDuplicateTags = { ...plantTreeDto, tagIds: [1, 1, 2] };
        (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(
          mockRestaurant,
        );

        await expect(
          service.plantTree(dtoWithDuplicateTags, mockUserId),
        ).rejects.toThrow(new BadRequestException('중복된 태그가 존재합니다'));
      });

      it('유효하지 않은 태그가 있을 경우 ConflictException을 던져야 함', async () => {
        (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(
          mockRestaurant,
        );
        (prisma.tag.count as jest.Mock).mockResolvedValue(100000);

        await expect(
          service.plantTree(plantTreeDto, mockUserId),
        ).rejects.toThrow(
          new ConflictException('사용할 수 없는 태그가 존재합니다.'),
        );
      });

      it('모든 검증을 통과하면 repository.plantTree를 호출하고 결과를 반환해야 함', async () => {
        const expectedResult = { ...mockSavedRestaurant, ...plantTreeDto };
        (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(
          mockRestaurant,
        );
        (prisma.tag.count as jest.Mock).mockResolvedValue(
          plantTreeDto.tagIds.length,
        );
        (repository.plantTree as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.plantTree(plantTreeDto, mockUserId);

        expect(repository.plantTree).toHaveBeenCalledWith(
          plantTreeDto,
          mockUserId,
        );
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('getRecommendations', () => {
    it('should call repository.getRecommendations', async () => {
      const expectedResult = [];
      (repository.getRecommendations as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await service.getRecommendations();

      expect(repository.getRecommendations).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getFollowersTree', () => {
    it('should call repository.getFollowersTree with userId and restaurantId', async () => {
      const expectedResult = [mockSavedRestaurant];
      (repository.getFollowersTree as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await service.getFollowersTree(
        mockUserId,
        mockRestaurantId,
      );

      expect(repository.getFollowersTree).toHaveBeenCalledWith(
        mockUserId,
        mockRestaurantId,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
