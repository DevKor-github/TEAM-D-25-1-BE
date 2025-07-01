import { Restaurant, SavedRestaurant, User } from "@prisma/client"

export type TreeDetail = {
    user: User;
    restaurant: Restaurant;
    tree: SavedRestaurant;
}