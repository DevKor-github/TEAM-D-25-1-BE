import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import * as admin from "firebase-admin"
import { FirebaseAuthStrategy } from "./strategies/firebase.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { AppleStrategy } from "./strategies/apple.strategy"; 
import { FirebaseAuthGuard } from "./guards/firebase-auth.guard";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from './controller';
import { AuthService } from "./service";
import { PrismaModule } from "../prisma/prisma.module";

const serviceAccount = require('../../firebase-adminsdk.json');

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'firebase-auth' }),
        PrismaModule
    ],
    providers: [
        AuthService,
        {
            provide: 'FIREBASE_ADMIN',
            useFactory: (config: ConfigService) => {
                const APP_NAME = 'GrooApp';
                if (!admin.apps.length || !admin.apps.find(app => app.name === APP_NAME)){
                    return admin.initializeApp({
                        credential: admin.credential.cert(
                            serviceAccount as admin.ServiceAccount
                        ),
                        projectId: 'groo-test'
                    }, APP_NAME)
                }
                return admin.app(APP_NAME)
            },
            inject: [ConfigService]
        },
        FirebaseAuthStrategy,
        GoogleStrategy,
        AppleStrategy,
        FirebaseAuthGuard,
    ],
    exports: [FirebaseAuthGuard],
    controllers: [AuthController]
})

export class AuthModule{}