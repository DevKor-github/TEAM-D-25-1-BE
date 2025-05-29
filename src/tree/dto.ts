import { 
    IsLatitude, 
    IsLongitude, 
    IsUUID, 
    IsNumber,
    IsString,
    IsBoolean
} from "class-validator";

export class UpdateTreeDto{

}

export class CreateTreeDto{

}

export class RemoveTreeDto{

}

export class Coordinate{
    @IsLatitude()
    lat: string;

    @IsLongitude()
    lon: string;
}

export class RestaurantId{
    @IsUUID()
    restaurantId: string;
}

export class TreeIdDto {
    @IsUUID()
    treeId: string;
}

export class WaterTreeDto {
    @IsUUID()
    treeId: string;
    // 물의 양 등 필요한 필드 추가 가능
}

export class PlantTreeDto {
    @IsNumber()
    treeTypeId: number;

    @IsUUID()
    restaurantId: string;

    // 기타 심기 관련 정보 추가
}