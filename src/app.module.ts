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

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    UserModule,
    AuthModule,
    TreeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
