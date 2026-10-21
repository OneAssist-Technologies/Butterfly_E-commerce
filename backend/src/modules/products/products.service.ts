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

  private mapProductImageUrl(product: any) {
    if (!product) return product;
    const isDataUrl = typeof product.image === 'string' && product.image.startsWith('data:');
    const imageUrl = isDataUrl
      ? `http://localhost:3001/api/v1/products/${product.id}/image`
      : product.image;

    let images = product.images;
    if (Array.isArray(images) && images.length > 0) {
      images = images.map((img: string) => {
        if (typeof img === 'string' && img.startsWith('data:')) {
          return `http://localhost:3001/api/v1/products/${product.id}/image`;
        }
        return img;
      });
    } else {
      images = [imageUrl];
    }

    return {
      ...product,
      image: imageUrl,
      images,
    };
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

    const products = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        model: true,
        name: true,
        size: true,
        screenSizeCategory: true,
        badge: true,
        resolution: true,
        resolutionCategory: true,
        os: true,
        smartOS: true,
        smartCategory: true,
        sound: true,
        displayTech: true,
        price: true,
        numericPrice: true,
        priceCategory: true,
        brand: true,
        isFilledButton: true,
        buttonLabel: true,
        featuredRank: true,
        inStock: true,
        features: true,
        keyFeatures: true,
        technicalSpecs: true,
        warrantyInstallation: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy,
    });

    return products.map((p) => ({
      ...p,
      image: `http://localhost:3001/api/v1/products/${p.id}/image`,
      images: [`http://localhost:3001/api/v1/products/${p.id}/image`],
    }));
  }

  async findOne(idOrModel: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrModel },
          { model: { equals: idOrModel, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        model: true,
        name: true,
        size: true,
        screenSizeCategory: true,
        badge: true,
        resolution: true,
        resolutionCategory: true,
        os: true,
        smartOS: true,
        smartCategory: true,
        sound: true,
        displayTech: true,
        price: true,
        numericPrice: true,
        priceCategory: true,
        brand: true,
        isFilledButton: true,
        buttonLabel: true,
        featuredRank: true,
        inStock: true,
        features: true,
        keyFeatures: true,
        technicalSpecs: true,
        warrantyInstallation: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID or Model '${idOrModel}' not found.`);
    }

    return {
      ...product,
      image: `http://localhost:3001/api/v1/products/${product.id}/image`,
      images: [`http://localhost:3001/api/v1/products/${product.id}/image`],
    };
  }

  async getReviews(idOrModel: string) {
    const product = await this.findOne(idOrModel);
    const reviews = await this.prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    return {
      productId: product.id,
      productModel: product.model,
      totalReviews,
      averageRating,
      reviews,
    };
  }

  async addReview(
    idOrModel: string,
    userId: string | null,
    userName: string,
    userEmail: string | null,
    dto: { rating: number; title?: string; comment: string },
  ) {
    const product = await this.findOne(idOrModel);
    return this.prisma.review.create({
      data: {
        productId: product.id,
        userId: userId || undefined,
        userName: userName || 'Verified Customer',
        userEmail: userEmail || undefined,
        rating: Math.min(5, Math.max(1, Number(dto.rating) || 5)),
        title: dto.title || undefined,
        comment: dto.comment,
      },
    });
  }

  async getImageBuffer(idOrModel: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrModel },
          { model: { equals: idOrModel, mode: 'insensitive' } },
        ],
      },
      select: {
        image: true,
      },
    });

    if (!product || !product.image) {
      throw new NotFoundException(`Product image for '${idOrModel}' not found.`);
    }

    if (product.image.startsWith('data:')) {
      const matches = product.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        return {
          mimeType: matches[1],
          buffer: Buffer.from(matches[2], 'base64'),
        };
      }
    }

    throw new NotFoundException(`No binary image stored for product '${idOrModel}'.`);
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
