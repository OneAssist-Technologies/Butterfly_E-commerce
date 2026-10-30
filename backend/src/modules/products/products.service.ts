import { Injectable, NotFoundException, ConflictException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto.js';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.migrateLegacyBase64Images();
    } catch (err) {
      this.logger.warn(
        `Legacy Base64 image migration skipped: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  public getBaseUrl(): string {
    const backendUrl = process.env.BACKEND_URL || process.env.BASE_URL;
    if (backendUrl && !backendUrl.includes('localhost') && !backendUrl.includes('127.0.0.1')) {
      return backendUrl.replace(/\/$/, '');
    }
    // Return empty string so product images always use clean, portable relative URLs (/api/v1/products/:id/image)
    // without leaking localhost into live production responses
    return '';
  }

  /**
   * Automatically extracts Base64 image data into physical files on disk
   * and converts product records to clean relative URLs.
   */
  async saveBase64Image(dataUrl: string, prefix = 'tv'): Promise<string> {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return dataUrl;
    }

    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) {
      return dataUrl;
    }

    const meta = dataUrl.substring(0, commaIndex);
    const base64Data = dataUrl.substring(commaIndex + 1).replace(/\s/g, '');
    const mimeMatch = meta.match(/data:([^;,]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/avif': '.avif',
    };
    const ext = extMap[mimeType] || '.jpg';
    const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'products');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));

    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/api/v1/products/images/${filename}`;
  }

  /**
   * One-time non-destructive migration: scans database for products storing
   * raw Base64 data and moves them onto disk in /uploads/products/.
   */
  async migrateLegacyBase64Images(): Promise<void> {
    const productsWithBase64 = await this.prisma.product.findMany({
      where: {
        OR: [
          { image: { startsWith: 'data:' } },
          { images: { isEmpty: false } },
        ],
      },
      select: {
        id: true,
        model: true,
        image: true,
        images: true,
      },
    });

    for (const prod of productsWithBase64) {
      let needsUpdate = false;
      let newImage = prod.image;
      let newImages = Array.isArray(prod.images) ? [...prod.images] : [];

      if (typeof prod.image === 'string' && prod.image.startsWith('data:')) {
        newImage = await this.saveBase64Image(prod.image, `migrated-${prod.id}-primary`);
        needsUpdate = true;
      }

      if (Array.isArray(prod.images) && prod.images.length > 0) {
        const migratedList: string[] = [];
        for (let idx = 0; idx < prod.images.length; idx++) {
          const img = prod.images[idx];
          if (typeof img === 'string' && img.startsWith('data:')) {
            const migratedUrl = await this.saveBase64Image(img, `migrated-${prod.id}-${idx}`);
            migratedList.push(migratedUrl);
            needsUpdate = true;
          } else {
            migratedList.push(img);
          }
        }
        newImages = migratedList;
      } else if (newImage) {
        newImages = [newImage];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await this.prisma.product.update({
          where: { id: prod.id },
          data: {
            image: newImage,
            images: newImages,
          },
        });
        this.logger.log(`Migrated Base64 images to disk for TV model ${prod.model} (${prod.id}).`);
      }
    }
  }

  async findAll(query?: {
    model?: string;
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

    // Filter by model storage name (e.g. "Android", "Google Android")
    if (query?.model && query.model !== 'All') {
      andConditions.push({
        model: { equals: query.model.trim(), mode: 'insensitive' },
      });
    }

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
          image: true,
          images: true,
          resolution: true,
          resolutionCategory: true,
          os: true,
          smartOS: true,
          smartCategory: true,
          sound: true,
          displayTech: true,
          price: true,
          numericPrice: true,
          originalPrice: true,
          originalNumericPrice: true,
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
      this.logger.warn(`Primary products findMany query failed, falling back: ${queryErr instanceof Error ? queryErr.message : queryErr}`);
      products = await this.prisma.product.findMany({
        where,
        select: {
          id: true,
          model: true,
          name: true,
          size: true,
          screenSizeCategory: true,
          badge: true,
          image: true,
          images: true,
          resolution: true,
          resolutionCategory: true,
          os: true,
          smartOS: true,
          smartCategory: true,
          sound: true,
          displayTech: true,
          price: true,
          numericPrice: true,
          originalPrice: true,
          originalNumericPrice: true,
          priceCategory: true,
          brand: true,
          isFilledButton: true,
          buttonLabel: true,
          featuredRank: true,
          isTopSelling: true,
          inStock: true,
          features: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [{ featuredRank: 'asc' }, { createdAt: 'desc' }],
      });
    }

    const baseUrl = this.getBaseUrl();
    return products.map((p) => {
      let imageUrl = p.image;
      if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
        imageUrl = `${baseUrl}/api/v1/products/${p.id}/image`;
      }

      let images: string[] = [];
      if (Array.isArray(p.images) && p.images.length > 0) {
        images = p.images.map((img: string, idx: number) => {
          if (typeof img === 'string' && img.startsWith('data:')) {
            return `${baseUrl}/api/v1/products/${p.id}/images/${idx}`;
          }
          return img;
        });
      } else if (imageUrl) {
        images = [imageUrl];
      }

      return {
        ...p,
        isTopSelling: p.isTopSelling ?? false,
        keyFeatures: p.keyFeatures ?? [],
        technicalSpecs: p.technicalSpecs ?? null,
        warrantyInstallation: p.warrantyInstallation ?? null,
        whatsIncluded: p.whatsIncluded ?? [],
        image: imageUrl || (images[0] ?? ''),
        images,
      };
    });
  }

  async findOne(idOrModel: string) {
    const selectFields = {
      id: true,
      model: true,
      name: true,
      size: true,
      screenSizeCategory: true,
      badge: true,
      image: true,
      images: true,
      resolution: true,
      resolutionCategory: true,
      os: true,
      smartOS: true,
      smartCategory: true,
      sound: true,
      displayTech: true,
      price: true,
      numericPrice: true,
      originalPrice: true,
      originalNumericPrice: true,
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
    };

    let product = await this.prisma.product.findUnique({
      where: { id: idOrModel },
      select: selectFields,
    });

    if (!product) {
      product = await this.prisma.product.findFirst({
        where: {
          model: { equals: idOrModel, mode: 'insensitive' },
        },
        select: selectFields,
      });
    }

    if (!product) {
      throw new NotFoundException(`Product with ID or Model '${idOrModel}' not found.`);
    }

    const baseUrl = this.getBaseUrl();
    let imageUrl = product.image;
    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
      imageUrl = `${baseUrl}/api/v1/products/${product.id}/image`;
    }

    let images: string[] = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      images = product.images.map((img: string, idx: number) => {
        if (typeof img === 'string' && img.startsWith('data:')) {
          return `${baseUrl}/api/v1/products/${product.id}/images/${idx}`;
        }
        return img;
      });
    } else if (imageUrl) {
      images = [imageUrl];
    }

    return {
      ...product,
      image: imageUrl || (images[0] ?? ''),
      images,
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
    index?: number,
  ): Promise<{ buffer: Buffer; mimeType: string } | { redirectUrl: string }> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrModel },
          { model: { equals: idOrModel, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        image: true,
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product image for '${idOrModel}' not found.`);
    }

    let targetImage = product.image;
    if (typeof index === 'number' && Array.isArray(product.images) && product.images[index]) {
      targetImage = product.images[index];
    }

    if (!targetImage) {
      throw new NotFoundException(`Product image for '${idOrModel}' not found.`);
    }

    // If it's a Base64 data URL
    if (targetImage.startsWith('data:')) {
      const commaIndex = targetImage.indexOf(',');
      if (commaIndex !== -1) {
        const meta = targetImage.substring(0, commaIndex);
        const base64Data = targetImage.substring(commaIndex + 1).replace(/\s/g, '');
        const mimeMatch = meta.match(/data:([^;,]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        return {
          mimeType,
          buffer: Buffer.from(base64Data, 'base64'),
        };
      }
    }

    // If it's an uploaded image stored in /uploads/products/
    const uploadMatch = targetImage.match(/\/api\/v1\/products\/images\/([^?#]+)/);
    if (uploadMatch) {
      const filename = path.basename(uploadMatch[1]);
      const filePath = path.join(process.cwd(), 'uploads', 'products', filename);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filename).toLowerCase();
        const mimeMap: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.avif': 'image/avif',
        };
        const mimeType = mimeMap[ext] || 'image/jpeg';
        const buffer = await fs.promises.readFile(filePath);
        return {
          mimeType,
          buffer,
        };
      }
    }

    // For static assets or remote URLs, redirect
    return {
      redirectUrl: targetImage,
    };
  }

  async create(dto: CreateProductDto) {
    const { id: _id, priceNumber: _priceNumber, ...data } = dto as any;

    // Convert any Base64 image payload to physical files on disk before PostgreSQL insert
    if (typeof data.image === 'string' && data.image.startsWith('data:')) {
      data.image = await this.saveBase64Image(data.image, 'tv-primary');
    }

    if (Array.isArray(data.images) && data.images.length > 0) {
      data.images = await Promise.all(
        data.images.map((img: string, idx: number) => {
          if (typeof img === 'string' && img.startsWith('data:')) {
            return this.saveBase64Image(img, `tv-gallery-${idx}`);
          }
          return img;
        }),
      );
    } else if (data.image) {
      data.images = [data.image];
    }

    try {
      return await this.prisma.product.create({
        data,
      });
    } catch (err: any) {
      this.logger.error(`Product create error: ${err?.message || err}`, err?.stack);
      throw err;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(id);
    const { id: _id, priceNumber: _priceNumber, ...data } = dto as any;

    if (typeof data.image === 'string' && data.image.startsWith('data:')) {
      data.image = await this.saveBase64Image(data.image, 'tv-primary');
    }

    if (Array.isArray(data.images) && data.images.length > 0) {
      data.images = await Promise.all(
        data.images.map((img: string, idx: number) => {
          if (typeof img === 'string' && img.startsWith('data:')) {
            return this.saveBase64Image(img, `tv-gallery-${idx}`);
          }
          return img;
        }),
      );
    } else if (data.image) {
      data.images = [data.image];
    }

    try {
      return await this.prisma.product.update({
        where: { id: existing.id },
        data,
      });
    } catch (err: any) {
      this.logger.error(`Product update error for ${id}: ${err?.message || err}`, err?.stack);
      throw err;
    }
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
