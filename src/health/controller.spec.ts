// Test example for TDD Environments
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './controller';
import { PrismaService } from '../prisma/prisma.service';
import { HttpStatus } from '@nestjs/common';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: PrismaService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return status OK when database connection is successful', async () => {
    jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ ok: 1 }]);

    const response = mockResponse();
    await controller.check(response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(response.json).toHaveBeenCalledWith({
      status: true,
      detail: { database: true },
    });
  });

  it('should return status SERVICE_UNAVAILABLE when database connection fails', async () => {
    jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ ok: 0 }]);

    const response = mockResponse();
    await controller.check(response);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.SERVICE_UNAVAILABLE,
    );
    expect(response.json).toHaveBeenCalledWith({
      status: false,
      detail: { database: false },
    });
  });

  it('should return status SERVICE_UNAVAILABLE when database connection throws error', async () => {
    jest
      .spyOn(prismaService, '$queryRaw')
      .mockRejectedValue(new Error('DB Connection Error'));

    const response = mockResponse();
    await controller.check(response);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.SERVICE_UNAVAILABLE,
    );
    expect(response.json).toHaveBeenCalledWith({
      status: false,
      detail: { database: false },
    });
  });
});
