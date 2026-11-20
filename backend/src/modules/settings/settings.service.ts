import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateSettingsDto } from './dto/settings.dto.js';

export const DEFAULT_SIZE_CARDS = [
  { size: '32"', tagline: 'Compact & Smart', image: '/menu_tv_32.jpg' },
  { size: '43"', tagline: 'Perfect for Every Home', image: '/menu_tv_43.jpg' },
  { size: '50"', tagline: 'True 4K Entertainment', image: '/menu_tv_50.jpg' },
  { size: '55"', tagline: 'Bigger Screen, Bigger Joy', image: '/menu_tv_55.jpg' },
  { size: '65"', tagline: 'The Ultimate Experience', image: '/menu_tv_65.jpg' },
];

export const DEFAULT_AVAILABLE_SIZES = ['32"', '43"', '50"', '55"', '65"', '75"', '85"'];

export const sanitizePhoneNumber = (val: any): string => {
  if (!val) return '';
  let d = String(val).replace(/\D/g, '');
  if (d.length > 10 && d.startsWith('91')) d = d.slice(2);
  else if (d.length > 10 && d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10);
};

const DEFAULT_SETTINGS = {
  id: 'default',
  companyName: 'Butterfly Enterprises',
  email: 'butterflytvs@gmail.com',
  supportEmail: 'support@butterflytv.in',
  phone: '8921793054',
  alternatePhone: '9876543210',
  whatsapp: '8921793054',
  address: 'Avinashi Road, Peelamedu',
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  pincode: '641004',
  country: 'India',
  locationUrl: 'https://butterflytv.in',
  supportHours: 'Mon - Sat | 9:00 AM - 6:00 PM (Working Hours)',
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
      if (!existing.sizeSelectorCards) {
        updates.sizeSelectorCards = DEFAULT_SIZE_CARDS;
      } else if (Array.isArray(existing.sizeSelectorCards)) {
        const has50 = (existing.sizeSelectorCards as any[]).some((c) => c.size === '50"');
        if (!has50) {
          const card50 = DEFAULT_SIZE_CARDS.find((c) => c.size === '50"')!;
          const idx43 = (existing.sizeSelectorCards as any[]).findIndex((c) => c.size === '43"');
          const newCards = [...(existing.sizeSelectorCards as any[])];
          if (idx43 !== -1) {
            newCards.splice(idx43 + 1, 0, card50);
          } else {
            newCards.push(card50);
          }
          updates.sizeSelectorCards = newCards;
        }
      }
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
        if (!settings.sizeSelectorCards) {
          updates.sizeSelectorCards = DEFAULT_SIZE_CARDS;
        } else if (Array.isArray(settings.sizeSelectorCards)) {
          const has50 = (settings.sizeSelectorCards as any[]).some((c) => c.size === '50"');
          if (!has50) {
            const card50 = DEFAULT_SIZE_CARDS.find((c) => c.size === '50"')!;
            const idx43 = (settings.sizeSelectorCards as any[]).findIndex((c) => c.size === '43"');
            const newCards = [...(settings.sizeSelectorCards as any[])];
            if (idx43 !== -1) {
              newCards.splice(idx43 + 1, 0, card50);
            } else {
              newCards.push(card50);
            }
            updates.sizeSelectorCards = newCards;
          }
        }
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

      if (settings) {
        if (settings.phone) settings.phone = sanitizePhoneNumber(settings.phone);
        if (settings.alternatePhone) settings.alternatePhone = sanitizePhoneNumber(settings.alternatePhone);
        if (settings.whatsapp) settings.whatsapp = sanitizePhoneNumber(settings.whatsapp);
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

      if (cleanDto.phone) cleanDto.phone = sanitizePhoneNumber(cleanDto.phone);
      if (cleanDto.alternatePhone) cleanDto.alternatePhone = sanitizePhoneNumber(cleanDto.alternatePhone);
      if (cleanDto.whatsapp) cleanDto.whatsapp = sanitizePhoneNumber(cleanDto.whatsapp);

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
