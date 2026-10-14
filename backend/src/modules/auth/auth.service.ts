import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

export class AdminLoginDto {
  email!: string;
  password!: string;
}

export const SUPER_ADMIN_CREDENTIALS = {
  primaryEmail: 'admin@buttterfly.com',
  alternateEmail: 'admin@butterfly.com',
  password: 'Butterfly@2026',
  role: 'SUPER_ADMIN',
  name: 'Super Admin',
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedSuperAdmin() {
    try {
      this.logger.log('Checking Super Admin seeding status...');
      
      // Try DB upsert if Prisma is connected
      const existing = await this.prisma.user.findFirst({
        where: {
          email: { in: [SUPER_ADMIN_CREDENTIALS.primaryEmail, SUPER_ADMIN_CREDENTIALS.alternateEmail] },
        },
      });

      if (!existing) {
        await this.prisma.user.create({
          data: {
            name: SUPER_ADMIN_CREDENTIALS.name,
            email: SUPER_ADMIN_CREDENTIALS.primaryEmail,
          },
        });
        this.logger.log(`Super Admin user (${SUPER_ADMIN_CREDENTIALS.primaryEmail}) seeded into database successfully.`);
      } else {
        this.logger.log(`Super Admin user (${existing.email}) is already present in database.`);
      }

      return {
        status: 'SUCCESS',
        message: 'Super Admin seeded successfully',
        admin: {
          name: SUPER_ADMIN_CREDENTIALS.name,
          email: SUPER_ADMIN_CREDENTIALS.primaryEmail,
          role: SUPER_ADMIN_CREDENTIALS.role,
        },
      };
    } catch (error) {
      this.logger.warn(`Database seed skipped or failed (falling back to memory): ${error instanceof Error ? error.message : error}`);
      return {
        status: 'IN_MEMORY_READY',
        message: 'Super Admin configured with credentials',
        admin: {
          name: SUPER_ADMIN_CREDENTIALS.name,
          email: SUPER_ADMIN_CREDENTIALS.primaryEmail,
          role: SUPER_ADMIN_CREDENTIALS.role,
        },
      };
    }
  }

  async validateAdminLogin(dto: AdminLoginDto) {
    const inputEmail = dto.email?.trim().toLowerCase();
    const inputPassword = dto.password;

    const isValidEmail =
      inputEmail === SUPER_ADMIN_CREDENTIALS.primaryEmail ||
      inputEmail === SUPER_ADMIN_CREDENTIALS.alternateEmail;

    const isValidPassword = inputPassword === SUPER_ADMIN_CREDENTIALS.password;

    if (!isValidEmail || !isValidPassword) {
      throw new UnauthorizedException('Invalid Admin credentials. Please check your email and password.');
    }

    return {
      success: true,
      token: `butterfly_admin_token_${Date.now()}_super_admin`,
      user: {
        id: 'super-admin-001',
        name: SUPER_ADMIN_CREDENTIALS.name,
        email: SUPER_ADMIN_CREDENTIALS.primaryEmail,
        role: SUPER_ADMIN_CREDENTIALS.role,
      },
      permissions: ['ALL_ACCESS', 'PRODUCTS_MANAGE', 'ENQUIRIES_MANAGE', 'ORDERS_MANAGE', 'SETTINGS_MANAGE'],
    };
  }
}
