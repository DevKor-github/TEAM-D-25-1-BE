import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startLog = `[${req.method}] ${req.originalUrl}`;
    let bodyLog = '';
    if (req.method === 'POST') {
      bodyLog = ` Request Body: ${JSON.stringify(req.body)}`;
    }
    res.on('finish', () => {
      const statusLog = ` Status: ${res.statusCode}`;
      Logger.log(startLog + bodyLog + statusLog, 'LoggerMiddleware');
    });
    next();
  }
}
