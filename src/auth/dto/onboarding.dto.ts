import { IsNotEmpty, IsString } from 'class-validator';

export class OnboardingInfoDto{
    @IsNotEmpty()
    @IsString()
    nickname: string;

    // TODO: 온보딩에 필요한 다른 필드 추가 및 데코레이터 적용
}