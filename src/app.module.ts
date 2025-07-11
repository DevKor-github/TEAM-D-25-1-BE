import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/module';
import { ConfigModule } from '@nestjs/config';
import getConfig from './config';
import { UserModule } from './user/module';
import { AuthModule } from './auth/module';
import { TreeModule } from './tree/module';
import { SearchModule } from './search/module';
import { NotificationModule } from './notification/module';
import { FirebaseModule } from './firebase.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true,
    }),
    FirebaseModule,
    PrismaModule,
    HealthModule,
    UserModule,
    AuthModule,
    TreeModule,
    SearchModule,
    NotificationModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
