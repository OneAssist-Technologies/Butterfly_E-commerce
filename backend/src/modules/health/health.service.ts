import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    database: {
      status: 'up' | 'down';
      message?: string;
    };
  };
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    let dbStatus: 'up' | 'down' = 'down';
    let dbMessage: string | undefined;

    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      dbStatus = 'up';
    } catch (error) {
      dbStatus = 'down';
      dbMessage = error instanceof Error ? error.message : 'Database ping failed';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV ?? 'development',
      services: {
        database: {
          status: dbStatus,
          ...(dbMessage ? { message: dbMessage } : {}),
        },
      },
    };
  }
}
