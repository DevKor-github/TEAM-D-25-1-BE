import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import * as admin from "firebase-admin"
import { FirebaseAuthStrategy } from "./strategies/firebase.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { AppleStrategy } from "./strategies/apple.strategy";
import { APP_GUARD } from "@nestjs/core";
import { FirebaseAuthGuard } from "./guards/firebase-auth.guard";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from './controller';

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'firebase-auth' })    
    ],
    providers: [
        {
            provide: 'FIREBASE_ADMIN',
            useFactory: (config: ConfigService) => {
                if (!admin.apps.length){
                    return admin.initializeApp({
                        credential: admin.credential.cert({
                            projectId: config.get<string>("FIREBASE_PROJECT_ID"),
                            clientEmail: config.get<string>("FIREBASE_CLIENT_EMAIL"),
                            privateKey: decodeURIComponent( //PrivateKey는 URL Encode 필요
                                config.get<string>("FIREBASE_PRIVATE_KEY")
                            )
                        })
                    })
                }
                return admin.app()
            },
            inject: [ConfigService]
        },
        FirebaseAuthStrategy,
        GoogleStrategy,
        AppleStrategy,
        {
            provide: APP_GUARD,
            useClass: FirebaseAuthGuard
        }
    ],
    exports: [],
    controllers: [AuthController]
})

export class AuthModule{}