import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  [key: string]: unknown;

  async onModuleInit(): Promise<void> {}

  async onModuleDestroy(): Promise<void> {}

  async $connect(): Promise<void> {}

  async $disconnect(): Promise<void> {}

  async $queryRaw(..._args: unknown[]): Promise<number> {
    return 1;
  }
}
