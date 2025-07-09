import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FirebaseAuthStrategy } from './strategies/firebase.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './controller';
import { AuthService } from './service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'firebase-auth' }),
    PrismaModule,
  ],
  providers: [
    FirebaseAuthStrategy,
    GoogleStrategy,
    AppleStrategy,
    FirebaseAuthGuard,
    AuthService,
  ],
  exports: [FirebaseAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
