import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import * as admin from 'firebase-admin';
import { FirebaseAuthStrategy } from './strategies/firebase.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controller';
import { AuthService } from './service';
import { PrismaModule } from '../prisma/prisma.module';
import { readFileSync } from 'fs';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'firebase-auth' }),
    PrismaModule,
  ],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const APP_NAME = 'GrooApp';
        const serviceAccountPath =
          configService.get<string>('firebaseAdminPath');
        if (!serviceAccountPath) {
          throw new Error(
            'FIREBASE_ADMIN_PATH is not set. Please check your config.yaml file.',
          );
        }
        const serviceAccount = JSON.parse(
          readFileSync(serviceAccountPath, 'utf8'),
        );
        if (
          !admin.apps.length ||
          !admin.apps.find((app) => app.name === APP_NAME)
        ) {
          return admin.initializeApp(
            {
              credential: admin.credential.cert(
                serviceAccount as admin.ServiceAccount,
              ),
              projectId: 'groo-test',
            },
            APP_NAME,
          );
        }
        return admin.app(APP_NAME);
      },
    },
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
