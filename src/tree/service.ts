import { Injectable } from "@nestjs/common";
import { TreeRepository } from "./repository";
import { Coordinate, PlantTreeDto } from './dto';
import { SavedRestaurant, Restaurant, User } from '@prisma/client';

@Injectable()
export class TreeService{
    constructor(
        private readonly treeRepository: TreeRepository,
    ){}

    async getAllFriendsTree(userId: string, restaurantId: string): Promise<SavedRestaurant[]>{
        console.log('Getting all friends trees for user:', userId, 'at restaurant:', restaurantId);
        const friendsTrees = await this.treeRepository.getAllFriendsTree(userId, restaurantId);
        return friendsTrees;
    }

    async getTreesByLocation(location: Coordinate): Promise<(Restaurant & { savedBy: SavedRestaurant[] })[]> {
        // TODO: Repository 이용 주변 나무들 불러오는 로직
        console.log('Getting trees by location:', location);
        const result = await this.treeRepository.getTreesByLocation(location);
        return result;
    }

    async getTreeById(restaurantId: string, userId: string): Promise<(SavedRestaurant & { user: User, restaurant: Restaurant }) | null> {
        console.log('Getting tree by ID:', restaurantId, 'by user:', userId);
        const result = await this.treeRepository.getTreeById(restaurantId, userId);
        return result;
    }

    async waterTree(restaurantId: string, userId: string): Promise<SavedRestaurant | null> {
        console.log('Watering tree:', restaurantId, 'by user:', userId);
        const result = await this.treeRepository.waterTree(restaurantId, userId);
        return result;
    }

    async plantTree(plantTreeDto: PlantTreeDto, userId: string): Promise<SavedRestaurant> {
        console.log('Planting tree:', plantTreeDto, 'by user:', userId);
        const newTree = await this.treeRepository.plantTree(plantTreeDto, userId);
        return newTree;
    }

    async getRecommendations(): Promise<SavedRestaurant[]> {
        // AI 관련 추천 추가 필요 on Service단
        console.log('Getting recommendations');
        const recommendations = await this.treeRepository.getRecommendations();
        return recommendations;
    }
}