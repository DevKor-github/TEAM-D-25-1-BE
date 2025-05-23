import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  UnauthorizedException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseInformation } from './interfaces/firbase-info.interface';
import * as admin from 'firebase-admin';
import { OnboardingInfoDto } from './dto/onboarding.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService
  ){}
  async validateUser(decoded: FirebaseInformation){
    const user = await this.prismaService.user.findUnique({
      where: { firebaseUid: decoded.uid }
    });

    if(!user){
      throw new UnauthorizedException("가입되지 않은 회원")
    }
    return user
  }

  async register(registerDto: any): Promise<any> {
    try {
      const firebaseUser = await admin.auth().createUser({
        email: registerDto.email,
        password: registerDto.password,
        displayName: registerDto.nickname,
      });

      const user = await this.prismaService.user.create({
        data: {
          firebaseUid: firebaseUser.uid,
          email: registerDto.email,
          nickname: registerDto.nickname,
          username: `user_${firebaseUser.uid.slice(0, 8)}`,
          isOnboarded: false,
        },
      });

      return { uid: user.firebaseUid, email: user.email };

    } catch (error: any) {
      console.error("Error in AuthService.register:", error);

      const errorMessage = error.message || '알 수 없는 회원가입 오류';

      throw new Error(`회원가입 실패: ${errorMessage}`);
    }
  }

  async completeOnboarding(userId: string, onboardingData: OnboardingInfoDto): Promise<any> {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...onboardingData,
          isOnboarded: true,
        },
      });
      return updatedUser;
    } catch (error) {
      throw new HttpException(
        `온보딩 실패: ${error.message || '알 수 없는 오류'}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
} 