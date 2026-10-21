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
      orderBy: [
        { featuredRank: 'asc' },
        { createdAt: 'desc' },
      ],
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
