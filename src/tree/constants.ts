import { TreeType } from "@/settings/dto";
import { Tag } from "@prisma/client";

export const TAG_KOREAN_MAP: { [key in Tag]: string } = {
  DRINKER: '애주가',
  VEGAN_OR_VEGETARIAN: '비건/채식',
  SPICY_FOOD_LOVER: '맵부심',
  PICKY_EATER: '편식쟁이',
  DESSERT_LOVER: '디저트 러버',
  DIETER: '다이어터',
  LATE_NIGHT_EATER: '야식',
  SWEET_TOOTH: '혈당 스파이크',
  HEALTH_CONSCIOUS: '건강식',
  VALUE_SEEKER: '가성비',
  MEAT_LOVER: '육식파',
  DIET_PLANNER: '식단',
  CAFFEINE_ADDICT: '카페인 중독',
  CLASSIC_TASTE: '클래식',
  STREET_FOOD_FAN: '길거리 음식',
  TTEOKBOKKI_LOVER: '떡볶이',
  SMALL_EATER: '소식좌',
  BIG_EATER: '대식가',
  SOLO_DINER: '혼밥러',
  SEAFOOD_LOVER: '해산물파',
  HEARTY_EATER: '든든파',

  STEAK: '스테이크',
  BREAD: '빵',
  HAMBURGER: '햄버거',
  CHICKEN: '치킨',
  GOPCHANG: '곱창',
  PASTA: '파스타',
  SHABU_SHABU: '샤브샤브',
  SOJU: '소주',
  SUSHI: '스시',
  GUKBAP: '국밥',
  COFFEE: '커피',
  DESSERT: '디저트',
  KIMCHI_JJIGAE: '김치찌개',
  PIZZA: '피자',
  RAMEN: '라면',
  DONKATSU: '돈까스'
};

export const STYLE_TAGS: Tag[] = [
  'DRINKER',
  'VEGAN_OR_VEGETARIAN',
  'SPICY_FOOD_LOVER',
  'PICKY_EATER',
  'DESSERT_LOVER',
  'DIETER',
  'LATE_NIGHT_EATER',
  'SWEET_TOOTH',
  'HEALTH_CONSCIOUS',
  'VALUE_SEEKER',
  'MEAT_LOVER',
  'DIET_PLANNER',
  'CAFFEINE_ADDICT',
  'CLASSIC_TASTE',
  'STREET_FOOD_FAN',
  'TTEOKBOKKI_LOVER',
  'SMALL_EATER',
  'BIG_EATER',
  'SOLO_DINER',
  'SEAFOOD_LOVER',
  'HEARTY_EATER'
];

export const FOOD_TAGS: Tag[] = [
  'STEAK',
  'BREAD',
  'HAMBURGER',
  'CHICKEN',
  'GOPCHANG',
  'PASTA',
  'SHABU_SHABU',
  'SOJU',
  'SUSHI',
  'GUKBAP',
  'DESSERT',
  'COFFEE',
  'KIMCHI_JJIGAE',
  'PIZZA',
  'RAMEN',
  'DONKATSU'
];

export const STYLE_TAG_KOREAN_MAP: Partial<{ [key in Tag]: string }> = Object.fromEntries(
  STYLE_TAGS.map(tag => [tag, TAG_KOREAN_MAP[tag]])
);

export const FOOD_TAG_KOREAN_MAP: Partial<{ [key in Tag]: string }> = Object.fromEntries(
  FOOD_TAGS.map(tag => [tag, TAG_KOREAN_MAP[tag]])
);

export const TREE_TYPES: TreeType[] = [
  {
    key: 0,
    name: '참나무',
    levels: [
      { level: 1, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chamnamu_1.png' },
      { level: 2, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chamnamu_2.png' },
      { level: 3, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chamnamu_3.png' },
    ],
  },
  {
    key: 1,
    name: '침엽수',
    levels: [
      { level: 1, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chimyeopsu_1.png' },
      { level: 2, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chimyeopsu_1.png' },
      { level: 3, imageUrl: 'https://groo-static.s3.ap-northeast-2.amazonaws.com/images/tree/chimyeopsu_1.png' },
    ],
  },
];