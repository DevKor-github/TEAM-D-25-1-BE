
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const userId = 'deadbeef-cafe-babe-face-c0ffeecafeee';
  const inputPath = path.join(__dirname, '..', 'input.json');
  const restaurantsData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  for (const restaurantData of restaurantsData) {
    const { naver_place_id: placeId, images: imagesToInsert } = restaurantData;

    if (!placeId || !imagesToInsert) {
      console.error('Invalid data format in input.json for an entry:', restaurantData);
      continue;
    }

    try {
      // Find the restaurant by placeId to get its internal ID
      const restaurant = await prisma.restaurant.findUnique({
        where: { placeId: String(placeId) },
        select: { id: true },
      });

      if (!restaurant) {
        console.error(`Error: Restaurant with placeId "${placeId}" not found.`);
        continue;
      }

      const restaurantId = restaurant.id;

      // Upsert the savedRestaurant entry
      const upsertedSavedRestaurant = await prisma.savedRestaurant.upsert({
        where: {
          userId_restaurantId: {
            userId: userId,
            restaurantId: restaurantId,
          },
        },
        update: {
          images: imagesToInsert,
        },
        create: {
          userId: userId,
          restaurantId: restaurantId,
          images: imagesToInsert,
          treeType: 0
        },
      });

      console.log('Successfully upserted savedRestaurant for placeId:', placeId);
      console.log(upsertedSavedRestaurant);
    } catch (error) {
      console.error(`Error upserting savedRestaurant for placeId "${placeId}":`, error);
    }
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
