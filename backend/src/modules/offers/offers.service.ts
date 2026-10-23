import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import {
  CreateOfferDto,
  UpdateOfferDto,
  ValidateCouponDto,
  DiscountTypeEnum,
} from './dto/offer.dto.js';



@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyActive = false) {
    if (onlyActive) {
      const now = new Date();
      return this.prisma.offer.findMany({
        where: {
          isActive: true,
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
        orderBy: [{ showInAnnouncement: 'desc' }, { createdAt: 'desc' }],
      });
    }

    return this.prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return offer;
  }

  async create(dto: CreateOfferDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.offer.findUnique({
      where: { code },
    });
    if (existing) {
      throw new ConflictException(`Offer coupon code '${code}' already exists`);
    }

    const offer = await this.prisma.offer.create({
      data: {
        title: dto.title.trim(),
        code,
        description: dto.description.trim(),
        offerType: dto.offerType?.trim() || 'COUPON',
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderAmount: dto.minOrderAmount ?? 0,
        maxDiscountAmount: dto.maxDiscountAmount ?? null,
        badge: dto.badge?.trim() || 'Special Offer',
        badgeColor: dto.badgeColor?.trim() || 'red',
        bannerText: dto.bannerText?.trim() || null,
        showInAnnouncement: dto.showInAnnouncement ?? true,
        showInHomepage: dto.showInHomepage ?? true,
        applyAutomatically: dto.applyAutomatically ?? false,
        stackable: dto.stackable ?? false,
        applicableSize: dto.applicableSize?.trim() || 'ALL',
        targetProducts: dto.targetProducts?.trim() || null,
        maxUsageLimit: dto.maxUsageLimit ?? null,
        usagePerCustomer: dto.usagePerCustomer ?? 1,
        termsConditions: dto.termsConditions?.trim() || null,
        configuration: dto.configuration ?? {},
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.log(`Created new offer: ${offer.code} (${offer.title})`);
    return offer;
  }

  async update(id: string, dto: UpdateOfferDto) {
    await this.findOne(id);

    const updateData: any = { ...dto };
    if (dto.code) {
      const formattedCode = dto.code.trim().toUpperCase();
      const existing = await this.prisma.offer.findFirst({
        where: {
          code: formattedCode,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Another offer is already using coupon code '${formattedCode}'`,
        );
      }
      updateData.code = formattedCode;
    }

    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    const updated = await this.prisma.offer.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Updated offer: ${updated.code}`);
    return updated;
  }

  async toggleActive(id: string) {
    const current = await this.findOne(id);
    const updated = await this.prisma.offer.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    this.logger.log(`Toggled offer active state: ${updated.code} -> ${updated.isActive}`);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.offer.delete({
      where: { id },
    });
    this.logger.log(`Deleted offer with ID: ${id}`);
    return { success: true, message: 'Offer deleted successfully' };
  }

  async validateCoupon(dto: ValidateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const orderAmount = Number(dto.orderAmount) || 0;

    const offer = await this.prisma.offer.findUnique({
      where: { code },
    });

    if (!offer) {
      throw new BadRequestException(`Promo code '${code}' is invalid or does not exist.`);
    }

    if (!offer.isActive) {
      throw new BadRequestException(`Promo code '${code}' is currently inactive.`);
    }

    const now = new Date();
    if (offer.startDate && new Date(offer.startDate) > now) {
      throw new BadRequestException(`Promo code '${code}' is not active yet.`);
    }

    if (offer.endDate && new Date(offer.endDate) < now) {
      throw new BadRequestException(`Promo code '${code}' has expired.`);
    }

    if (orderAmount < offer.minOrderAmount) {
      throw new BadRequestException(
        `Minimum order total of ₹${offer.minOrderAmount.toLocaleString('en-IN')} is required to apply '${code}'.`,
      );
    }

    let discountAmount = 0;
    let percent = 0;

    if (offer.discountType === DiscountTypeEnum.PERCENTAGE) {
      percent = offer.discountValue;
      discountAmount = Math.round((orderAmount * offer.discountValue) / 100);
      if (offer.maxDiscountAmount && discountAmount > offer.maxDiscountAmount) {
        discountAmount = offer.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(offer.discountValue, orderAmount);
    }

    // Increment usage
    await this.prisma.offer.update({
      where: { id: offer.id },
      data: { usageCount: { increment: 1 } },
    });

    return {
      valid: true,
      message: `Coupon '${code}' applied successfully!`,
      offer,
      discountAmount,
      discountPercent: percent,
    };
  }
}
