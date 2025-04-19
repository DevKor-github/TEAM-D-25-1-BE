import { Module } from '@nestjs/common';
import { UserService } from './service';
import { UserController } from './controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
