import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HealthController } from './controller';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {}
