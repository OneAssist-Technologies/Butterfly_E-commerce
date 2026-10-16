import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateEnquiryDto, UpdateEnquiryStatusDto } from './dto/enquiry.dto.js';

@Injectable()
export class EnquiriesService {
  private readonly logger = new Logger(EnquiriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { status?: string; search?: string }) {
    const where: Record<string, unknown> = {};

    if (query?.status && query.status !== 'All') {
      where.status = query.status as 'New' | 'Contacted' | 'Closed';
    }
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
        { productModel: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.enquiry.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const enquiry = await this.prisma.enquiry.findFirst({
      where: {
        OR: [{ id }, { enquiryNumber: id }],
      },
    });

    if (!enquiry) {
      throw new NotFoundException(`Enquiry '${id}' not found.`);
    }

    return enquiry;
  }

  async create(dto: CreateEnquiryDto) {
    const enquiryNumber = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateString = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const enquiry = await this.prisma.enquiry.create({
      data: {
        enquiryNumber,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        city: dto.city,
        message: dto.message || null,
        productModel: dto.productModel,
        productPrice: dto.productPrice || null,
        date: dateString,
        status: 'New',
      },
    });

    this.logger.log(`Created enquiry ${enquiry.enquiryNumber} from ${enquiry.name}`);
    return enquiry;
  }

  async updateStatus(id: string, dto: UpdateEnquiryStatusDto) {
    const existing = await this.findOne(id);
    return this.prisma.enquiry.update({
      where: { id: existing.id },
      data: { status: dto.status },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.enquiry.delete({
      where: { id: existing.id },
    });
  }
}
