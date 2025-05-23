import { Controller, Post, Body, UseGuards, HttpException, HttpStatus, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { User } from '../decorators/user.decorator';
import { AuthService } from './service';
import { OnboardingInfoDto } from './dto/onboarding.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController{
    constructor(
        private readonly authService: AuthService
    ){}

    @Post('onboard')
    @UseGuards(FirebaseAuthGuard)
    async getOnboardingInfo(
        @User() user: any,
        @Body() onboardingData: OnboardingInfoDto
    ): Promise<any> {
        const userId = user.uid;
        try {
            return await this.authService.completeOnboarding(userId, onboardingData);
        } catch (error: any) {
            throw new BadRequestException(`온보딩 처리 중 오류 발생: ${error.message || '알 수 없는 오류'}`);
        }
    }

    @Post('register')
    @UsePipes(ValidationPipe)
    async register(
        @Body() registerData: RegisterDto
    ): Promise<any> {
        try {
            const result = await this.authService.register(registerData);
            return result;
        } catch (error: any) {
            throw new BadRequestException(`회원가입 처리 중 오류 발생: ${error.message || '알 수 없는 오류'}`);
        }
    }
}
