import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto.js';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getBaseUrl(): string {
    const backendUrl = process.env.BACKEND_URL || process.env.BASE_URL;
    if (backendUrl && !backendUrl.includes('localhost') && !backendUrl.includes('127.0.0.1')) {
      return backendUrl.replace(/\/$/, '');
    }
    // Return empty string so product images always use clean, portable relative URLs (/api/v1/products/:id/image)
    // without leaking localhost into live production responses
    return '';
  }

  private mapProductImageUrl(product: any) {
    if (!product) return product;
    const baseUrl = this.getBaseUrl();
    const isDataUrl = typeof product.image === 'string' && product.image.startsWith('data:');
    let imageUrl = isDataUrl
      ? `${baseUrl}/api/v1/products/${product.id}/image`
      : product.image;

    if (typeof imageUrl === 'string' && (imageUrl.includes('localhost:') || imageUrl.includes('127.0.0.1:'))) {
      imageUrl = imageUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
    }

    let images = product.images;
    if (Array.isArray(images) && images.length > 0) {
      images = images.map((img: string) => {
        if (typeof img === 'string' && img.startsWith('data:')) {
          return `${baseUrl}/api/v1/products/${product.id}/image`;
        }
        if (typeof img === 'string' && (img.includes('localhost:') || img.includes('127.0.0.1:'))) {
          return img.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
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

    // Filter by screen size(s) - e.g. "55"", "55", "55 inch", or "43",55""
    if (query?.size && query.size !== 'All') {
      const rawSizes = query.size.split(',').map((s) => s.trim()).filter(Boolean);
      const expandedSizes = new Set<string>();
      rawSizes.forEach((sz) => {
        expandedSizes.add(sz);
        const num = sz.match(/\d{2,3}/)?.[0];
        if (num) {
          expandedSizes.add(num);
          expandedSizes.add(`${num}"`);
          expandedSizes.add(`${num} inch`);
          expandedSizes.add(`${num} Inch`);
        }
      });
      const sizeList = Array.from(expandedSizes);
      andConditions.push({
        OR: [
          { size: { in: sizeList } },
          { screenSizeCategory: { in: sizeList } },
        ],
      });
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

    // Search keyword in name, model, size, screenSizeCategory, resolution, or OS
    if (query?.search && query.search.trim()) {
      const s = query.search.trim();
      const numMatch = s.match(/(\d{2,3})/)?.[1];
      const searchOr: any[] = [
        { name: { contains: s, mode: 'insensitive' } },
        { model: { contains: s, mode: 'insensitive' } },
        { size: { contains: s, mode: 'insensitive' } },
        { screenSizeCategory: { contains: s, mode: 'insensitive' } },
        { resolution: { contains: s, mode: 'insensitive' } },
        { resolutionCategory: { contains: s, mode: 'insensitive' } },
        { os: { contains: s, mode: 'insensitive' } },
        { smartOS: { contains: s, mode: 'insensitive' } },
        { displayTech: { contains: s, mode: 'insensitive' } },
      ];

      // If search query mentions a TV size number (e.g. "55", "55 inch", "55-inch", "55"")
      if (numMatch) {
        searchOr.push(
          { size: { contains: numMatch, mode: 'insensitive' } },
          { size: { contains: `${numMatch}"`, mode: 'insensitive' } },
          { screenSizeCategory: { contains: numMatch, mode: 'insensitive' } },
          { model: { contains: numMatch, mode: 'insensitive' } },
          { name: { contains: numMatch, mode: 'insensitive' } },
        );
      }

      andConditions.push({ OR: searchOr });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Sorting order
    let orderBy: any = [{ isTopSelling: 'desc' }, { featuredRank: 'asc' }, { createdAt: 'desc' }];
    if (query?.sort === 'price-asc') {
      orderBy = [{ numericPrice: 'asc' }];
    } else if (query?.sort === 'price-desc') {
      orderBy = [{ numericPrice: 'desc' }];
    } else if (query?.sort === 'name-asc') {
      orderBy = [{ name: 'asc' }];
    }

    let products: any[] = [];
    try {
      products = await this.prisma.product.findMany({
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
          isTopSelling: true,
          inStock: true,
          features: true,
          keyFeatures: true,
          technicalSpecs: true,
          warrantyInstallation: true,
          whatsIncluded: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy,
      });
    } catch (queryErr) {
      this.logger.warn(`Primary products findMany query failed, falling back to safe columns: ${queryErr instanceof Error ? queryErr.message : queryErr}`);
      products = await this.prisma.product.findMany({
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
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [{ featuredRank: 'asc' }, { createdAt: 'desc' }],
      });
    }

    const baseUrl = this.getBaseUrl();
    return products.map((p) => ({
      ...p,
      isTopSelling: p.isTopSelling ?? false,
      keyFeatures: p.keyFeatures ?? [],
      technicalSpecs: p.technicalSpecs ?? null,
      warrantyInstallation: p.warrantyInstallation ?? null,
      whatsIncluded: p.whatsIncluded ?? [],
      image: `${baseUrl}/api/v1/products/${p.id}/image`,
      images: [`${baseUrl}/api/v1/products/${p.id}/image`],
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
        isTopSelling: true,
        inStock: true,
        features: true,
        keyFeatures: true,
        technicalSpecs: true,
        warrantyInstallation: true,
        whatsIncluded: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID or Model '${idOrModel}' not found.`);
    }

    const baseUrl = this.getBaseUrl();
    return {
      ...product,
      image: `${baseUrl}/api/v1/products/${product.id}/image`,
      images: [`${baseUrl}/api/v1/products/${product.id}/image`],
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

  async getImageBuffer(
    idOrModel: string,
  ): Promise<{ buffer: Buffer; mimeType: string } | { redirectUrl: string }> {
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
      const commaIndex = product.image.indexOf(',');
      if (commaIndex !== -1) {
        const meta = product.image.substring(0, commaIndex);
        const base64Data = product.image.substring(commaIndex + 1).replace(/\s/g, '');
        const mimeMatch = meta.match(/data:([^;,]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        return {
          mimeType,
          buffer: Buffer.from(base64Data, 'base64'),
        };
      }
    }

    // For static assets or remote URLs, redirect
    return {
      redirectUrl: product.image,
    };
  }

  async create(dto: CreateProductDto) {
    const { id: _id, priceNumber: _priceNumber, ...data } = dto as any;
    return this.prisma.product.create({
      data: {
        ...data,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(id);
    const { id: _id, priceNumber: _priceNumber, ...data } = dto as any;
    return this.prisma.product.update({
      where: { id: existing.id },
      data,
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
