import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { status?: string; search?: string }) {
    const where: Record<string, unknown> = {};

    if (query?.status && query.status !== 'All') {
      const normalizedStatus = query.status === 'Pending Verification' ? 'PendingVerification' : query.status;
      where.status = normalizedStatus;
    }
    if (query?.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUserOrders(userId?: string, email?: string) {
    const conditions: any[] = [];
    if (userId) conditions.push({ userId });
    if (email) conditions.push({ email: { equals: email, mode: 'insensitive' } });
    if (conditions.length === 0) return [];

    return this.prisma.order.findMany({
      where: {
        OR: conditions,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(idOrNumber: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order '${idOrNumber}' not found.`);
    }

    return order;
  }

  async create(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let numericAmount = 0;
      const orderItemsData: {
        productId?: string;
        productModel: string;
        productName: string;
        price: string;
        numericPrice: number;
        quantity: number;
        lineTotal: number;
      }[] = [];

      if (dto.items && dto.items.length > 0) {
        for (const item of dto.items) {
          let unitPrice = 0;
          let productRecord: { id: string; numericPrice: number; price: string; model: string; name: string } | null = null;

          if (item.productId) {
            productRecord = await tx.product.findUnique({
              where: { id: item.productId },
            });
          }
          if (!productRecord && item.model) {
            productRecord = await tx.product.findFirst({
              where: { model: { equals: item.model, mode: 'insensitive' } },
            });
          }

          if (productRecord) {
            unitPrice = productRecord.numericPrice;
          } else {
            unitPrice = item.price ? (parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0) : 0;
          }

          const lineTotal = unitPrice * item.quantity;
          numericAmount += lineTotal;

          orderItemsData.push({
            productId: productRecord?.id,
            productModel: productRecord?.model || item.model,
            productName: productRecord?.name || item.name,
            price: productRecord?.price || item.price,
            numericPrice: unitPrice,
            quantity: item.quantity,
            lineTotal,
          });
        }
      } else {
        numericAmount = parseInt(dto.amount?.replace(/[^0-9]/g, '') || '0', 10) || 0;
      }

      const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const formattedAmount = `₹ ${numericAmount.toLocaleString('en-IN')}`;
      const dateString = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      // Link to user if account exists
      let userId: string | undefined;
      const existingUser = await tx.user.findFirst({
        where: { email: { equals: dto.email, mode: 'insensitive' } },
        select: { id: true },
      });
      if (existingUser) {
        userId = existingUser.id;
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: dto.customerName,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          userId,
          amount: formattedAmount,
          numericAmount,
          payment: dto.payment || 'Prepaid (UPI)',
          status: 'PendingVerification',
          date: dateString,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      this.logger.log(`Created new order request ${order.orderNumber} for ${order.email} (Pending Verification)`);
      return order;
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const existing = await this.findOne(id);
    const targetStatus = (dto.status === 'Pending Verification' ? 'PendingVerification' : dto.status) as any;
    return this.prisma.order.update({
      where: { id: existing.id },
      data: { status: targetStatus },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.order.delete({
      where: { id: existing.id },
    });
  }
}
