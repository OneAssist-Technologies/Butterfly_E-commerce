import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateSettingsDto } from './dto/settings.dto.js';

export const DEFAULT_SIZE_CARDS = [
  { size: '32"', tagline: 'Compact & Smart', image: '/menu_tv_32.jpg' },
  { size: '43"', tagline: 'Perfect for Every Home', image: '/menu_tv_43.jpg' },
  { size: '55"', tagline: 'Bigger Screen, Bigger Joy', image: '/menu_tv_55.jpg' },
  { size: '65"', tagline: 'The Ultimate Experience', image: '/menu_tv_65.jpg' },
];

export const DEFAULT_AVAILABLE_SIZES = ['32"', '43"', '50"', '55"', '65"', '75"', '85"'];

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
  sizeSelectorCards: DEFAULT_SIZE_CARDS,
  availableSizes: DEFAULT_AVAILABLE_SIZES,
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
    } else {
      const updates: any = {};
      if (!existing.sizeSelectorCards) updates.sizeSelectorCards = DEFAULT_SIZE_CARDS;
      if (!(existing as any).availableSizes) updates.availableSizes = DEFAULT_AVAILABLE_SIZES;
      if (Object.keys(updates).length > 0) {
        await this.prisma.companySetting.update({
          where: { id: 'default' },
          data: updates,
        });
        this.logger.log('Updated existing company settings with defaults.');
      }
    }
  }

  async getSettings() {
    try {
      let settings = await this.prisma.companySetting.findUnique({
        where: { id: 'default' },
      });

      if (!settings) {
        settings = await this.prisma.companySetting.create({
          data: DEFAULT_SETTINGS,
        });
      } else {
        const updates: any = {};
        if (!settings.sizeSelectorCards) updates.sizeSelectorCards = DEFAULT_SIZE_CARDS;
        if (!(settings as any).availableSizes) updates.availableSizes = DEFAULT_AVAILABLE_SIZES;
        if (Object.keys(updates).length > 0) {
          try {
            settings = await this.prisma.companySetting.update({
              where: { id: 'default' },
              data: updates,
            });
          } catch (updateErr) {
            this.logger.warn(`Non-critical settings default sync notice: ${updateErr}`);
          }
        }
      }

      return settings;
    } catch (err) {
      this.logger.error(`Error in getSettings, returning defaults: ${err instanceof Error ? err.message : err}`);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(dto: UpdateSettingsDto) {
    try {
      const { id, createdAt, updatedAt, ...cleanDto } = dto as any;
      const updated = await this.prisma.companySetting.upsert({
        where: { id: 'default' },
        update: {
          ...cleanDto,
        },
        create: {
          ...DEFAULT_SETTINGS,
          ...cleanDto,
        },
      });

      this.logger.log(`Updated company settings: ${updated.email}, ${updated.phone}, ${updated.city}`);
      return updated;
    } catch (err) {
      this.logger.error(`Error in updateSettings: ${err instanceof Error ? err.message : err}`);
      throw err;
    }
  }
}
