import { Module } from '@nestjs/common';
import { TreeController } from './controller';
import { TreeService } from './service';
import { TreeRepository } from './repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from "../auth/module";

@Module({
  imports: [AuthModule],
  controllers: [TreeController],
  providers: [TreeService, TreeRepository, PrismaService],
})
export class TreeModule {}