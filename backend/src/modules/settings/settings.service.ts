import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateSettingsDto } from './dto/settings.dto.js';

const DEFAULT_SETTINGS = {
  id: 'default',
  companyName: 'Butterfly Smart TV',
  email: 'butterflytvs@gmail.com',
  supportEmail: 'support@butterflytv.in',
  phone: '+91 422 430 1234',
  alternatePhone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  address: 'Butterfly Smart TV Technologies, Avinashi Road, Peelamedu',
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  pincode: '641004',
  country: 'India',
  locationUrl: 'https://maps.google.com/?q=Peelamedu+Coimbatore',
  supportHours: 'Mon - Sat | 9:00 AM - 6:00 PM IST',
};

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.ensureDefaultSettings();
    } catch (err) {
      this.logger.warn(`Could not seed default company settings: ${err instanceof Error ? err.message : err}`);
    }
  }

  private async ensureDefaultSettings() {
    const existing = await this.prisma.companySetting.findUnique({
      where: { id: 'default' },
    });

    if (!existing) {
      await this.prisma.companySetting.create({
        data: DEFAULT_SETTINGS,
      });
      this.logger.log('Default company settings seeded in PostgreSQL database.');
    }
  }

  async getSettings() {
    let settings = await this.prisma.companySetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await this.prisma.companySetting.create({
        data: DEFAULT_SETTINGS,
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const updated = await this.prisma.companySetting.upsert({
      where: { id: 'default' },
      update: {
        ...dto,
      },
      create: {
        ...DEFAULT_SETTINGS,
        ...dto,
      },
    });

    this.logger.log(`Updated company settings: ${updated.email}, ${updated.phone}, ${updated.city}`);
    return updated;
  }
}
