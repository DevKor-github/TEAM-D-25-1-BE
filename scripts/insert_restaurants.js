const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { v7: uuid } = require('uuid');
const Hangul = require('hangul-js');

const prisma = new PrismaClient();

function decomposeHangul(input) {
  const cleaned = String(input || '').replace(/\s/g, '');
  return Hangul.disassemble(cleaned).join('');
}

async function main() {
  // input.json 파일 경로 (프로젝트 루트 기준)
  const filePath = path.join(__dirname, '..', 'input.json');
  let restaurantsData;

  try {
    // 파일 읽기 및 JSON 파싱
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    restaurantsData = JSON.parse(fileContent);
    console.log(`Successfully read and parsed ${filePath}`);
  } catch (error) {
    console.error(`Error reading or parsing ${filePath}: ${error.message}`);
    process.exit(1); // 파일 처리 실패 시 스크립트 종료
  }

  // 데이터가 배열 형태인지 확인 (단일 객체인 경우 배열로 변환)
  if (!Array.isArray(restaurantsData)) {
    if (typeof restaurantsData === 'object' && restaurantsData !== null) {
      restaurantsData = [restaurantsData];
    } else {
      console.error(
        'Error: input.json does not contain a valid JSON array or object.',
      );
      process.exit(1);
    }
  }

  console.log(
    `Found ${restaurantsData.length} restaurants in input.json. Starting insertion/update...`,
  );

  let upsertedCount = 0;
  let skippedCount = 0;

  // 각 식당 데이터에 대해 upsert 작업 수행
  for (const restaurant of restaurantsData) {
    // 필수 필드 유효성 검사 (JSON 데이터 기준)
    if (
      !restaurant.id ||
      !restaurant.place_name ||
      !restaurant.road_address_name ||
      !restaurant.x ||
      !restaurant.y
    ) {
      console.warn(
        `Skipping restaurant due to missing required fields (id, place_name, road_address_name, x, y): ${JSON.stringify(restaurant)}`,
      );
      skippedCount++;
      continue;
    }

    try {
      const result = await prisma.restaurant.upsert({
        where: { placeId: restaurant.id }, // 고유 식별자인 placeId (JSON의 id 필드 사용)
        update: {
          name: restaurant.place_name,
          address: restaurant.road_address_name, // 도로명 주소 사용
          latitude: parseFloat(restaurant.y), // 문자열 좌표를 숫자로 변환
          longitude: parseFloat(restaurant.x), // 문자열 좌표를 숫자로 변환
        },
        create: {
          placeId: restaurant.id,
          name: restaurant.place_name,
          address: restaurant.road_address_name,
          latitude: parseFloat(restaurant.y),
          longitude: parseFloat(restaurant.x),
        },
      });
      console.log(
        `Upserted restaurant: ${result.name} (PlaceID: ${result.placeId})`,
      );

      // 자모 분해된 식당명 태그 저장 (중복 방지)
      try {
        const tagName = decomposeHangul(result.name);
        const existing = await prisma.searchRestaurantTag.findFirst({
          where: { restaurantId: result.id, name: tagName },
          select: { id: true },
        });
        if (!existing) {
          await prisma.searchRestaurantTag.create({
            data: { id: uuid(), restaurantId: result.id, name: tagName },
          });
          console.log(`  -> Created SearchRestaurantTag: ${tagName}`);
        } else {
          console.log(`  -> SearchRestaurantTag exists: ${tagName}`);
        }
      } catch (tagErr) {
        console.error(
          `  -> Failed to upsert SearchRestaurantTag: ${tagErr.message}`,
        );
      }
      upsertedCount++;
    } catch (error) {
      console.error(
        `Error upserting restaurant ${restaurant.place_name} (ID: ${restaurant.id}): ${error.message}`,
      );
      skippedCount++;
    }
  }

  console.log(`\nInsertion/Update complete.`);
  console.log(`Successfully upserted: ${upsertedCount}`);
  console.log(`Skipped due to errors or missing fields: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error('An unexpected error occurred:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Prisma Client 연결 종료
    await prisma.$disconnect();
    console.log('Prisma Client disconnected.');
  });
