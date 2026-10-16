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
      this.logger.log('Products database verification and upsert completed.');
    } catch (err) {
      this.logger.warn(`Could not seed initial products: ${err instanceof Error ? err.message : err}`);
    }
  }

  async findAll(query?: {
    size?: string;
    resolution?: string;
    smart?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    search?: string;
    sort?: string;
  }) {
    const where: any = {};
    const andConditions: any[] = [];

    // Filter by screen size(s) - e.g. "55"" or "43",55""
    if (query?.size && query.size !== 'All') {
      const sizes = query.size.split(',').map((s) => s.trim()).filter(Boolean);
      if (sizes.length === 1) {
        andConditions.push({
          OR: [
            { size: sizes[0] },
            { screenSizeCategory: sizes[0] },
          ],
        });
      } else if (sizes.length > 1) {
        andConditions.push({
          OR: [
            { size: { in: sizes } },
            { screenSizeCategory: { in: sizes } },
          ],
        });
      }
    }

    // Filter by resolution(s) - e.g. "4K UHD" or "Full HD"
    if (query?.resolution && query.resolution !== 'All') {
      const resList = query.resolution.split(',').map((r) => r.trim()).filter(Boolean);
      if (resList.length === 1) {
        andConditions.push({
          OR: [
            { resolution: { contains: resList[0], mode: 'insensitive' } },
            { resolutionCategory: { contains: resList[0], mode: 'insensitive' } },
          ],
        });
      } else if (resList.length > 1) {
        andConditions.push({
          OR: resList.flatMap((r) => [
            { resolution: { contains: r, mode: 'insensitive' } },
            { resolutionCategory: { contains: r, mode: 'insensitive' } },
          ]),
        });
      }
    }

    // Filter by smart OS/feature - e.g. "Google TV" or "Android TV"
    if (query?.smart && query.smart !== 'All') {
      const smartList = query.smart.split(',').map((s) => s.trim()).filter(Boolean);
      const smartConditions = smartList.flatMap((s) => [
        { smartCategory: { contains: s, mode: 'insensitive' } },
        { smartOS: { contains: s, mode: 'insensitive' } },
        { os: { contains: s, mode: 'insensitive' } },
      ]);
      andConditions.push({ OR: smartConditions });
    }

    // Filter by price bounds
    if (query?.minPrice !== undefined || query?.maxPrice !== undefined) {
      const priceFilter: any = {};
      if (query.minPrice !== undefined && query.minPrice !== '') {
        const min = parseInt(String(query.minPrice).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(min)) priceFilter.gte = min;
      }
      if (query.maxPrice !== undefined && query.maxPrice !== '') {
        const max = parseInt(String(query.maxPrice).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(max)) priceFilter.lte = max;
      }
      if (Object.keys(priceFilter).length > 0) {
        andConditions.push({ numericPrice: priceFilter });
      }
    }

    // Search keyword in name, model, size, or resolution
    if (query?.search && query.search.trim()) {
      const s = query.search.trim();
      andConditions.push({
        OR: [
          { name: { contains: s, mode: 'insensitive' } },
          { model: { contains: s, mode: 'insensitive' } },
          { size: { contains: s, mode: 'insensitive' } },
          { resolution: { contains: s, mode: 'insensitive' } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Sorting order
    let orderBy: any = [{ featuredRank: 'asc' }, { createdAt: 'desc' }];
    if (query?.sort === 'price-asc') {
      orderBy = [{ numericPrice: 'asc' }];
    } else if (query?.sort === 'price-desc') {
      orderBy = [{ numericPrice: 'desc' }];
    } else if (query?.sort === 'name-asc') {
      orderBy = [{ name: 'asc' }];
    }

    return this.prisma.product.findMany({
      where,
      orderBy,
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
