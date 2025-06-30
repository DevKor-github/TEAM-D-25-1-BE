import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { TreeRepository } from "./repository";
import { Coordinate, PlantTreeDto } from './dto';
import { SavedRestaurant, Restaurant, User } from '@prisma/client';
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class TreeService{
    constructor(
        private readonly treeRepository: TreeRepository,
        private readonly prisma: PrismaService,
    ){}

    async getFollowersTree(userId: string, restaurantId: string): Promise<SavedRestaurant[]>{
        console.log('Getting all friends trees for user:', userId, 'at restaurant:', restaurantId);
        const friendsTrees = await this.treeRepository.getFollowersTree(userId, restaurantId);
        return friendsTrees;
    }

    async getTreesByLocation(
        userId: string, 
        zoom: number, 
        location: Coordinate
    ): Promise<Restaurant[]> {
        console.log('Getting trees by location:', location);
        const result = await this.treeRepository.getTreesByLocation(userId, zoom, location);
        return result;
    }

    async getTreeById(
        treeId: string, 
        userId: string
    ): Promise<(SavedRestaurant & { user: User, restaurant: Restaurant }) | null> {
        const parts = treeId.split('_')
        if (parts.length !== 2) throw new BadRequestException('잘못된 형식의 treeId입니다.')
        
        const [ownerId, restaurantId] = parts

        let isAllowed = false
        if (ownerId === userId) isAllowed = true
        else {
            const relation = await this.prisma.follower.findUnique({
                where: {
                    userId_followerId: {
                        userId: ownerId,
                        followerId: userId
                    },
                    status: 'ACCEPTED'
                }
            })
        }

        if (!isAllowed) throw new ForbiddenException('이 나무에 접근할 수 없습니다.')
        
        const tree = await this.treeRepository.getTreeById(ownerId, restaurantId)
        if (!tree) throw new NotFoundException('해당하는 나무를 찾을 수 없습니다.')

        return tree
    }

    async getTreesByRestaurantId(restaurantId: string, userId: string): Promise<(SavedRestaurant & { user: User, restaurant: Restaurant })[]> {
        const followings = await this.prisma.follower.findMany({
            where: { followerId: userId, status: 'ACCEPTED' },
            select: { userId: true }
        })
        const followingIds = followings.map(e => e.userId)

        const targetUids = [...followingIds, userId]
        
        return this.treeRepository.getTreesByRestaurantId(restaurantId, targetUids);
    }

    async waterTree(restaurantId: string, userId: string): Promise<SavedRestaurant | null> {
        console.log('Watering tree:', restaurantId, 'by user:', userId);
        const { lastWatered = new Date(0) } = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { lastWatered: true }
        })

        if (Date.now() - lastWatered.getTime() < 4 * 60 * 60 * 1000){
            throw new BadRequestException({
                message: '아직 물을 줄 수 없습니다.',
                lastWatered
            })
        }
        
        const result = await this.treeRepository.waterTree(restaurantId, userId);
        return result;
    }

    async plantTree(
        plantTreeDto: PlantTreeDto,
        userId: string
    ): Promise<SavedRestaurant> {
        const { tagIds, restaurantId } = plantTreeDto

        const restaurant = await this.prisma.restaurant.findUnique({ 
            where:  { id: restaurantId },
            select: { id: true }
        }); 
        if (!restaurant) throw new BadRequestException(`Id: ${restaurantId}에 해당하는 식당을 찾을 수 없습니다.`)

        if (new Set(tagIds).size !== tagIds.length) throw new BadRequestException('중복된 태그가 존재합니다')

        const validTagsCount = await this.prisma.tag.count({ where: { id: { in: tagIds }}})
        if (validTagsCount !== tagIds.length) throw new BadRequestException('사용할 수 없는 태그가 존재합니다.')

        return this.treeRepository.plantTree(plantTreeDto, userId);
    }

    async getRecommendations(): Promise<SavedRestaurant[]> {
        // AI 관련 추천 추가 필요 on Service단
        console.log('Getting recommendations');
        const recommendations = await this.treeRepository.getRecommendations();
        return recommendations;
    }
}