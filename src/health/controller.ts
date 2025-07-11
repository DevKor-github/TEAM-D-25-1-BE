import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import { ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class HealthCheckDetail {
  @ApiProperty({
    description: '데이터베이스 연결 상태',
    example: true,
  })
  @IsBoolean()
  database: boolean;
}

export class HealthCheckResponse {
  @ApiProperty({
    description: '헬스 체크 상태',
    example: true,
  })
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: '상세 상태 정보',
    type: HealthCheckDetail,
  })
  detail: HealthCheckDetail;
}

@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Health check',
    type: HealthCheckResponse,
  })
  async check(@Res() res: Response) {
    const detail = {
      database: true,
    };

    // Check database connection
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
