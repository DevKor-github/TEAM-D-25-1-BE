import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/module';
import { ConfigModule } from '@nestjs/config';
import getConfig from './config';
import { UserModule } from './user/module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
