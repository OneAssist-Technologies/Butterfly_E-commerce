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
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service.js';
import {
  CreateOfferDto,
  UpdateOfferDto,
  ValidateCouponDto,
} from './dto/offer.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  /**
   * Public: Retrieve active offers (for customer homepage, announcement banner, offers page, cart)
   */
  @Get()
  async getActiveOffers(@Query('all') all?: string) {
    const showAll = all === 'true';
    return this.offersService.findAll(!showAll);
  }

  /**
   * Admin: Retrieve all offers (active, inactive, scheduled)
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER')
  async getAdminOffers() {
    return this.offersService.findAll(false);
  }

  /**
   * Public: Validate and calculate discount for a coupon code in cart checkout
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.offersService.validateCoupon(dto);
  }

  /**
   * Public / Admin: Get single offer details
   */
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  /**
   * Admin: Create a new offer
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  /**
   * Admin: Update an existing offer
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER')
  async update(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.offersService.update(id, dto);
  }

  /**
   * Admin: Toggle active state of an offer
   */
  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER')
  async toggleActive(@Param('id') id: string) {
    return this.offersService.toggleActive(id);
  }

  /**
   * Admin: Delete an offer
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER')
  async remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }
}
