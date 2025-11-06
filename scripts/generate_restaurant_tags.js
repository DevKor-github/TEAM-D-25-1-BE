const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { v7: uuid } = require('uuid');
const Hangul = require('hangul-js');

const prisma = new PrismaClient();

function decomposeHangul(input) {
  // 공백 제거
  const cleanedInput = input.replace(/\s/g, '');

  // hangul-js를 사용하여 자모 분리
  const decomposed = Hangul.disassemble(cleanedInput);

  return decomposed.join('');
}

/**
 * 네이버 플레이스 ID로 레스토랑을 찾고 태그를 생성하는 함수
 * @param {string} naverPlaceId - 네이버 플레이스 ID
 * @param {string[]} tags - 태그 배열
 */
async function generateRestaurantTags(naverPlaceId, tags) {
  try {
    console.log(`\n🔍 네이버 플레이스 ID로 레스토랑 검색 중: ${naverPlaceId}`);

    // 네이버 플레이스 ID로 레스토랑 찾기
    const restaurant = await prisma.restaurant.findUnique({
      where: { placeId: naverPlaceId },
      select: { id: true, name: true, placeId: true },
    });

    if (!restaurant) {
      console.log(`❌ 레스토랑을 찾을 수 없습니다: ${naverPlaceId}`);
      return false;
    }

    console.log(`✅ 레스토랑 찾음: ${restaurant.name} (ID: ${restaurant.id})`);

    // 기존 태그 삭제 (선택사항 - 필요에 따라 주석 처리)
    await prisma.searchRestaurantTag.deleteMany({
      where: { restaurantId: restaurant.id },
    });
    console.log(`🗑️  기존 태그 삭제 완료`);

    // 레스토랑 이름으로 태그 생성
    const nameTag = decomposeHangul(restaurant.name);
    await prisma.searchRestaurantTag.create({
      data: {
        id: uuid(),
        restaurantId: restaurant.id,
        name: nameTag,
      },
    });
    console.log(
      `📝 레스토랑 이름 태그 생성: ${nameTag} (원본: ${restaurant.name})`,
    );

    // 제공된 태그들로 태그 생성
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tag of tags) {
        if (typeof tag === 'string' && tag.trim().length > 0) {
          const decomposedTag = decomposeHangul(tag);

          // 중복 방지
          const existingTag = await prisma.searchRestaurantTag.findFirst({
            where: {
              restaurantId: restaurant.id,
              name: decomposedTag,
            },
          });

          if (!existingTag) {
            await prisma.searchRestaurantTag.create({
              data: {
                id: uuid(),
                restaurantId: restaurant.id,
                name: decomposedTag,
              },
            });
            console.log(`🏷️  태그 생성: ${decomposedTag} (원본: ${tag})`);
          } else {
            console.log(`⏭️  태그 이미 존재: ${decomposedTag} (원본: ${tag})`);
          }
        }
      }
    }

    console.log(`✅ 태그 생성 완료: ${restaurant.name}`);
    return true;
  } catch (error) {
    console.error(`❌ 태그 생성 실패: ${error.message}`);
    return false;
  }
}

/**
 * JSON 파일에서 레스토랑 데이터를 읽어와 태그를 생성하는 메인 함수
 */
async function main() {
  try {
    console.log('🚀 레스토랑 태그 생성 스크립트 시작');

    // input.json 파일 경로 (프로젝트 루트 기준)
    const filePath = path.join(__dirname, '..', 'input.json');

    if (!fs.existsSync(filePath)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const restaurants = JSON.parse(fileContent);

    if (!Array.isArray(restaurants)) {
      console.error('❌ JSON 파일이 배열 형태가 아닙니다.');
      return;
    }

    console.log(
      `📊 총 ${restaurants.length}개의 레스토랑 데이터를 처리합니다.`,
    );

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];

      if (!restaurant.naver_place_id) {
        console.log(
          `⚠️  ${i + 1}/${restaurants.length}: naver_place_id가 없습니다.`,
        );
        failCount++;
        continue;
      }

      console.log(`\n📋 ${i + 1}/${restaurants.length} 처리 중...`);

      const success = await generateRestaurantTags(
        restaurant.naver_place_id,
        restaurant.tags || [],
      );

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // 데이터베이스 연결 안정성을 위한 짧은 대기
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 태그 생성 완료!`);
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${failCount}개`);
  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 데이터베이스 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateRestaurantTags,
  decomposeHangul,
};
