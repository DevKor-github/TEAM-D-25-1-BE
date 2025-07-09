import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import * as admin from 'firebase-admin';

@Global()
@Module({
  imports: [ConfigModule],
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
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
