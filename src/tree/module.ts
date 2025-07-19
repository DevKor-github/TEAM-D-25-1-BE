import { Module } from '@nestjs/common';
import { TreeController } from './controller';
import { TreeService } from './service';
import { TreeRepository } from './repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '../auth/module';
import { UserRepository } from '@/user/repositories/user';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';

@Module({
  imports: [AuthModule],
  controllers: [TreeController],
  providers: [
    TreeService,
    TreeRepository,
    PrismaService,
    UserRepository,
    AccessTokenGuard,
  ],
})
export class TreeModule {}
