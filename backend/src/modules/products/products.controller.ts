import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ProductsService } from './products.service.js';
import { CreateProductDto, CreateReviewDto, UpdateProductDto } from './dto/product.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAll(
    @Query('size') size?: string,
    @Query('resolution') resolution?: string,
    @Query('smart') smart?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.findAll({
      size,
      resolution,
      smart,
      minPrice,
      maxPrice,
      search,
      sort,
    });
  }

  /**
   * Dedicated multi-image upload endpoint.
   * Accepts multipart/form-data with up to 10 files (field name 'files' or any field).
   * Validates file format and enforces a strict 10MB limit per image.
   */
  @Post('upload-images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: multer.diskStorage({
        destination: (_req: any, _file: any, cb: any) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'products');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req: any, file: any, cb: any) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
          cb(null, `tv-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per image
        files: 10,
      },
      fileFilter: (_req: any, file: any, cb: any) => {
        const allowedMime = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/svg+xml',
          'image/avif',
        ];
        if (!allowedMime.includes(file.mimetype.toLowerCase())) {
          return cb(
            new BadRequestException(
              `Unsupported file format '${file.mimetype}'. Only JPEG, PNG, WebP, SVG, and AVIF are allowed.`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: any[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files were provided for upload.');
    }
    const baseUrl = this.productsService.getBaseUrl();
    const uploaded = files.map((f: any) => ({
      url: `${baseUrl}/api/v1/products/images/${f.filename}`,
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
    }));
    return {
      urls: uploaded.map((u: any) => u.url),
      files: uploaded,
    };
  }

  /**
   * Dedicated single-image upload endpoint.
   */
  @Post('upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: multer.diskStorage({
        destination: (_req: any, _file: any, cb: any) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'products');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req: any, file: any, cb: any) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
          cb(null, `tv-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (_req: any, file: any, cb: any) => {
        const allowedMime = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/svg+xml',
          'image/avif',
        ];
        if (!allowedMime.includes(file.mimetype.toLowerCase())) {
          return cb(
            new BadRequestException(
              `Unsupported file format '${file.mimetype}'. Only JPEG, PNG, WebP, SVG, and AVIF are allowed.`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadSingleImage(@UploadedFiles() files: any[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image file was provided for upload.');
    }
    const baseUrl = this.productsService.getBaseUrl();
    const f = files[0];
    const url = `${baseUrl}/api/v1/products/images/${f.filename}`;
    return {
      url,
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
    };
  }

  /**
   * Static image streaming for uploaded product images in /uploads/products/.
   */
  @Get('images/:filename')
  async getUploadedImage(@Param('filename') filename: string, @Res() res: Response) {
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'uploads', 'products', safeFilename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Product image '${safeFilename}' not found.`);
    }
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.avif': 'image/avif',
    };
    const mimeType = mimeMap[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }

  @Get(':id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const result = await this.productsService.getImageBuffer(id);
    if ('redirectUrl' in result) {
      return res.redirect(result.redirectUrl);
    }
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.send(result.buffer);
  }

  @Get(':id/images/:index')
  async getImageByIndex(
    @Param('id') id: string,
    @Param('index') indexStr: string,
    @Res() res: Response,
  ) {
    const index = parseInt(indexStr, 10) || 0;
    const result = await this.productsService.getImageBuffer(id, index);
    if ('redirectUrl' in result) {
      return res.redirect(result.redirectUrl);
    }
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.send(result.buffer);
  }

  @Get(':id/reviews')
  async getReviews(@Param('id') id: string) {
    return this.productsService.getReviews(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addReview(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: CreateReviewDto,
  ) {
    const userId = req.user?.sub || req.user?.id || null;
    const userName = req.user?.name || req.user?.email || 'Verified Customer';
    const userEmail = req.user?.email || null;
    return this.productsService.addReview(id, userId, userName, userEmail, dto);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/toggle-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER')
  async toggleStock(@Param('id') id: string) {
    return this.productsService.toggleStock(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER')
  async delete(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
