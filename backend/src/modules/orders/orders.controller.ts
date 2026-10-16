import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAll({ status, search });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
