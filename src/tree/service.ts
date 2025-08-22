import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TreeRepository } from './repository';
import {
  Coordinate,
  PlantTreeDto,
  TreeDetailResponse,
  TreeDetailWithUserResponse,
} from './dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TreeDetail } from './types';
import { UserParam } from '@/user/params/user';
import config from '@/config';
import { CreateWaterNotificationUseCase } from '@/notification/usecases/createWaterNotification';
import { UserResponse } from '@/user/dtos/user';

const toTreeDetailResponse = (detail: TreeDetail): TreeDetailResponse => {
  if (!detail.tree || !detail.restaurant) return null;

  const images = (detail.tree.images ?? []).map(
    (key) => `https://${config().s3.cloudfrontUrl}/${key}`,
  );

  return {
    treeId: `${detail.tree.userId}_${detail.tree.restaurantId}`,
    name: detail.restaurant.name,
    address: detail.restaurant.address,
    latitude: String(detail.restaurant.latitude),
    longitude: String(detail.restaurant.longitude),
    treeType: detail.tree.treeType,
    review: detail.tree.review,
    tags: detail.tree.tag,
    createdAt: detail.tree.createdAt,
    updatedAt: detail.tree.updatedAt,
    recommendationCount: detail.tree.recommendedByUsers.length + 1,
    images,
  };
};

const toTreeDetailWithUserResponse = (
  detail: TreeDetail,
): TreeDetailWithUserResponse => {
  const treeResp = toTreeDetailResponse(detail);

  return {
    ...treeResp,
    user: detail.user,
  };
};

@Injectable()
export class TreeService {
  constructor(
    private readonly treeRepository: TreeRepository,
    private readonly prisma: PrismaService,
    private readonly waterNotificationUseCase: CreateWaterNotificationUseCase,
  ) {}

  async getFollowersTree(
    user: UserParam,
    restaurantId: string,
  ): Promise<TreeDetailResponse[]> {
    const friendsTrees = await this.treeRepository.getFollowersTree(
      user.id,
      restaurantId,
    );
    return friendsTrees.map(toTreeDetailResponse);
  }

  async getTreesByLocation(
    user: UserParam,
    zoom: number,
    location: Coordinate,
  ): Promise<TreeDetailResponse[]> {
    console.log('Getting trees by location:', location);
    const data = await this.treeRepository.getTreesByLocation(
      user.id,
      zoom,
      location,
    );

    return data.map(toTreeDetailResponse).filter(Boolean);
  }

  async getTreeById(
    treeId: string,
    user: UserParam,
  ): Promise<TreeDetailResponse> {
    const [ownerId, restaurantId] = treeId.split('_');

    let isAllowed = false;
    if (ownerId === user.id) isAllowed = true;
    else {
      const relation = await this.prisma.follower.findUnique({
        where: {
          userId_followerId: {
            userId: ownerId,
            followerId: user.id,
          },
          status: 'ACCEPTED',
        },
      });

      if (relation) isAllowed = true;
    }

    if (!isAllowed)
      throw new ForbiddenException('이 나무에 접근할 수 없습니다.');

    const treeData = await this.treeRepository.getTreeById(
      ownerId,
      restaurantId,
    );
    if (!treeData)
      throw new NotFoundException('해당하는 나무를 찾을 수 없습니다.');

    return toTreeDetailResponse(treeData);
  }

  async getTreesByRestaurantId(
    restaurantId: string,
    user: UserParam,
  ): Promise<TreeDetailWithUserResponse[]> {
    const followings = await this.prisma.follower.findMany({
      where: { followerId: user.id, status: 'ACCEPTED' },
      select: { userId: true },
    });
    const followingIds = followings.map((e) => e.userId);
    const targetUids = [...followingIds, user.id];
    const treeDatas = await this.treeRepository.getTreesByRestaurantId(
      restaurantId,
      targetUids,
    );

    return treeDatas.map(toTreeDetailWithUserResponse);
  }

  async waterTree(
    treeId: string,
    user: UserParam,
  ): Promise<TreeDetailResponse> {
    /* const lastWatered = user.lastWatered || new Date(0);

    if (Date.now() - lastWatered.getTime() < 4 * 60 * 60 * 1000) {
      throw new BadRequestException({
        message: '아직 물을 줄 수 없습니다.',
        lastWatered,
      });
    } */
    const parts = treeId.split('_');
    const [ownerId, restaurantId] = parts;
    if (ownerId === user.id)
      throw new BadRequestException('자신의 나무에는 물을 줄 수 없습니다.');

    const recommendationData = await this.treeRepository.getRecommendedByUsersByTreeId(ownerId, restaurantId)

    if (!recommendationData) throw new NotFoundException('해당하는 나무를 찾을 수 없습니다.');
    if (recommendationData.recommendedByUsers.includes(user.id)) throw new ConflictException('이미 물을 준 나무입니다.')

    const result = await this.treeRepository.waterTree(
      ownerId,
      restaurantId,
      user.id,
    );

    await this.waterNotificationUseCase.execute({
      userId: ownerId,
      treeType: result.tree.treeType,
      restaurantId,
    });

    return toTreeDetailResponse(result);
  }

  async plantTree(
    plantTreeDto: PlantTreeDto,
    user: UserParam,
  ): Promise<{ treeId: string }> {
    const { restaurantId, images } = plantTreeDto;

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant)
      throw new NotFoundException('존재하지 않는 Restaurant입니다.');

    const existingTree = await this.prisma.savedRestaurant.findUnique({
      where: { userId_restaurantId: { userId: user.id, restaurantId } },
    });
    if (existingTree)
      throw new ConflictException('이미 나무를 심은 Restaurant입니다.');

    const savableImages = this.stripImageUrlPrefix(images);

    const newTree = await this.treeRepository.plantTree(
      {
        ...plantTreeDto,
        images: savableImages,
      },
      user.id,
    );

    return {
      treeId: `${newTree.userId}_${newTree.restaurantId}`,
    };
  }

  async getRecommendations(): Promise<TreeDetailResponse[]> {
    // AI 관련 추천 추가 필요 on Service단
    console.log('Getting recommendations');
    const recommendations = await this.treeRepository.getRecommendations();
    return recommendations.map(toTreeDetailResponse);
  }

  stripImageUrlPrefix(urlList: string[]): string[] {
    if (urlList === undefined || urlList === null) return [];

    return urlList.map((url) =>
      url.replace(`https://${config().s3.cloudfrontUrl}/`, ''),
    );
  }

  // private async validateImages(keys: string[]): Promise<void> {
  //   const foundKeys = await this.prisma.images.findMany({
  //     where: {
  //       key: { in: keys },
  //     },
  //     select: { key: true },
  //   });
  //   if (foundKeys.length === keys.length) return;

  //   const foundKeysSet = new Set(foundKeys.map((e) => e.key));
  //   const missing = keys.filter((key) => !foundKeysSet.has(key));

  //   throw new BadRequestException({
  //     message: `key에 해당하는 이미지가 없습니다. ${missing.join(', ')}`,
  //     missingImages: missing,
  //   });
  // }
}
