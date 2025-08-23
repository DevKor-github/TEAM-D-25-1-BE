import { Restaurant, SavedRestaurant } from '@prisma/client';
import config from '@/config';

export type UserTreeType = SavedRestaurant & { restaurant: Restaurant };

export interface TreeDescriptionResult {
  recapMessage: string;
  recapImageUrl: string;
}

export function getRecapDescription(treeCount: number): TreeDescriptionResult {
  let imageUrl: string;
  let text: string;

  if (treeCount <= 0) {
    imageUrl = null;
    text = '아직 심은 나무가 없어요.';
  } else if (treeCount <= 30) {
    imageUrl = `https://${config().s3.cloudfrontUrl}/images/recap/1.png`;
    if (treeCount <= 10) {
      text = '베란다 화분만큼 심었어요';
    } else if (treeCount <= 20) {
      text = '앞마당 텃밭만큼 자랐어요';
    } else {
      text = '조그만 정원이 생겼어요';
    }
  } else if (treeCount <= 100) {
    imageUrl = `https://${config().s3.cloudfrontUrl}/images/recap/2.png`;
    if (treeCount <= 40) {
      text = '동네 공원처럼 푸르게 자랐어요';
    } else if (treeCount <= 50) {
      text = '작은 숲 하나를 만든 셈이에요';
    } else if (treeCount <= 80) {
      text = '뒷산이 부럽지 않을 만큼 풍성해졌어요';
    } else {
      text = '울창한 숲을 통째로 옮겨놓은 기분이에요';
    }
  } else {
    imageUrl = `https://${config().s3.cloudfrontUrl}/images/recap/3.png`;
    text = '아마존만큼이나 크고 울창해졌어요!';
  }

  return { recapMessage: text, recapImageUrl: imageUrl };
}

export function getBiggestTrees(trees: UserTreeType[]): UserTreeType[] {
  if (!trees || trees.length === 0) {
    return [];
  }

  let maxRecommendations = 0;
  for (const tree of trees) {
    if (
      tree.recommendedByUsers &&
      tree.recommendedByUsers.length > maxRecommendations
    ) {
      maxRecommendations = tree.recommendedByUsers.length;
    }
  }

  if (maxRecommendations === 0) {
    return [];
  }

  return trees.filter(
    (tree) =>
      tree.recommendedByUsers &&
      tree.recommendedByUsers.length === maxRecommendations,
  );
}
