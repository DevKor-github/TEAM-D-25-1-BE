import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Response } from 'express';

@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async check(@Res() res: Response) {
    let detail = {
      database: true,
    };

    try {
      const healthCheck = await this.prismaService.$queryRaw`SELECT 1 AS ok`;

      if (healthCheck[0]['ok'] !== 1) detail.database = false;
    } catch (error) {
      detail.database = false;
    }

    const status = Object.values(detail).every((v) => v);
    return res
      .status(status ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
      .json({
        status,
        detail,
      });
  }
}
