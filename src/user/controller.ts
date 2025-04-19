import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Response } from 'express';

@Controller('users/me')
export class UserController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('places')
  async check(@Res() res: Response) {
    return res.json({
      message: 'Hello World',
    });
  }
}
