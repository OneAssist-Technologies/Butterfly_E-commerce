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
} from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service.js';
import { CreateProductDto, CreateReviewDto, UpdateProductDto } from './dto/product.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

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

  @Get(':id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const { buffer, mimeType } = await this.productsService.getImageBuffer(id);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.send(buffer);
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
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/toggle-stock')
  async toggleStock(@Param('id') id: string) {
    return this.productsService.toggleStock(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

