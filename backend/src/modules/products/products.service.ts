import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto.js';
import { seedProductsIfEmpty } from './products.seed.js';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await seedProductsIfEmpty(this.prisma);
      this.logger.log('Products database verification completed.');
    } catch (err) {
      this.logger.warn(`Could not seed initial products: ${err instanceof Error ? err.message : err}`);
    }
  }

  async findAll(query?: {
    size?: string;
    resolution?: string;
    search?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (query?.size && query.size !== 'All') {
      where.size = query.size;
    }
    if (query?.resolution && query.resolution !== 'All') {
      where.resolution = { contains: query.resolution, mode: 'insensitive' };
    }
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { model: { contains: query.search, mode: 'insensitive' } },
        { size: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      orderBy: [
        { featuredRank: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(idOrModel: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrModel },
          { model: { equals: idOrModel, mode: 'insensitive' } },
        ],
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID or Model '${idOrModel}' not found.`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(id);
    return this.prisma.product.update({
      where: { id: existing.id },
      data: dto,
    });
  }

  async toggleStock(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.product.update({
      where: { id: existing.id },
      data: { inStock: !existing.inStock },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.product.delete({
      where: { id: existing.id },
    });
  }
}
