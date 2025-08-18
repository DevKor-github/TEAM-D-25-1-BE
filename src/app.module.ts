import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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
import { ImagesModule } from './images/module';
import { LoggerMiddleware } from './logger.middleware';
import { SettingsModule } from './settings/module';
import { RestaurantModule } from './restaurant/module';

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
    RestaurantModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
