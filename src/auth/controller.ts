import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '../decorators/user.decorator';
import { AuthService } from './service';
import { OnboardingInfoRequest } from './dto/onboarding.dto';
import { RegisterRequest, RegisterResponse } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { ApiResponse, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AuthUserResponse,
  FirebaseLoginDto,
  FirebaseLoginResponseDto,
} from './dto/authUser.dto';
import { User as PrismaUser } from '@prisma/client';
import { AccessTokenGuard } from './guards/access-token.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private mapToUserResponse(user: PrismaUser): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      nickname: user.nickname,
      socialProvider: user.socialProvider,
      socialId: user.socialId,
      isPrivate: user.isPrivate,
      status: user.status,
      firebaseUid: user.firebaseUid,
      isOnboarded: user.isOnboarded,
      profileImageUrl: null,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Get restaurant list',
    type: AuthUserResponse,
  })
  @Post('onboard')
  @UseGuards(AccessTokenGuard)
  async getOnboardingInfo(
    @User() user: any,
    @Body() onboardingData: OnboardingInfoRequest,
  ): Promise<AuthUserResponse> {
    const userId = user.uid;
    try {
      const result = await this.authService.completeOnboarding(
        userId,
        onboardingData,
      );

      return this.mapToUserResponse(result);
    } catch (error: any) {
      throw new BadRequestException(
        `온보딩 처리 중 오류 발생: ${error.message || '알 수 없는 오류'}`,
      );
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Register user',
    type: RegisterResponse,
  })
  @Post('register')
  @UsePipes(ValidationPipe)
  async register(
    @Body() registerData: RegisterRequest,
  ): Promise<{ accessToken: string; user: any }> {
    try {
      const result = await this.authService.register(registerData);

      return {
        accessToken: result.accessToken,
        user: this.mapToUserResponse(result.user),
      };
    } catch (error: any) {
      throw new BadRequestException(
        `회원가입 처리 중 오류 발생: ${error.message || '알 수 없는 오류'}`,
      );
    }
  }

  @Post('sign-in/firebase')
  @ApiOperation({ summary: 'Firebase AccessToken으로 회원가입/로그인' })
  @ApiBody({ type: FirebaseLoginDto })
  @ApiResponse({
    status: 201,
    description: '로그인/회원가입 성공',
    type: FirebaseLoginResponseDto,
  })
  async firebaseLogin(@Body() body: FirebaseLoginDto) {
    return this.authService.firebaseLoginOrRegister(body.firebaseAccessToken);
  }
}
