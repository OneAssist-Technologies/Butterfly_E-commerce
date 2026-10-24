import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../../database/prisma.service.js';

// Pre-computed dummy bcrypt hash for timing attack mitigation on missing accounts
const DUMMY_BCRYPT_HASH = '$2a$10$e8m4wW1b2eJ6v6W8a6Z7yOzXk7U4L9a9b2eJ6v6W8a6Z7yOzXk7U4';

export const ADMIN_ALIASES = ['admin@butterfly.com'];

export class AdminLoginDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class CustomerLoginDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class CustomerRegisterDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;
}

export class CreateAdminUserDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  password?: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getAdminCredentials() {
    const email =
      this.configService.get<string>('ADMIN_EMAIL') ||
      process.env.ADMIN_EMAIL;
    const password =
      this.configService.get<string>('ADMIN_PASSWORD') ||
      process.env.ADMIN_PASSWORD;

    if (!email?.trim() || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured.');
    }

    return {
      email: email.trim().toLowerCase(),
      password,
      name:
        this.configService.get<string>('ADMIN_NAME') ||
        process.env.ADMIN_NAME ||
        'Super Admin',
      role: 'SUPER_ADMIN' as const,
    };
  }

  private getJwtSecret(): string {
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET must be configured.');
    }

    return secret;
  }

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  async seedSuperAdmin() {
    try {
      this.logger.log('Synchronizing Super Admin credentials in database...');

      const adminCreds = this.getAdminCredentials();
      const hashedPassword = await bcrypt.hash(adminCreds.password, 10);

      const existing = await this.prisma.user.findFirst({
        where: { email: { equals: adminCreds.email, mode: 'insensitive' } },
      });

      if (!existing) {
        await this.prisma.user.create({
          data: {
            name: adminCreds.name,
            email: adminCreds.email,
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            department: 'Executive Administration',
          },
        });
        this.logger.log(`Configured Super Admin (${adminCreds.email}) created.`);
      } else {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            name: adminCreds.name,
            role: 'SUPER_ADMIN',
            password: hashedPassword,
            department: existing.department || 'Executive Administration',
          },
        });
        this.logger.log(`Configured Super Admin (${adminCreds.email}) synchronized.`);
      }

      return {
        status: 'SUCCESS',
        message: 'Super Admin synchronized successfully with secure hash in database',
        admin: {
          name: adminCreds.name,
          email: adminCreds.email,
          role: adminCreds.role,
        },
      };
    } catch (error) {
      this.logger.warn(`Database seed skipped or failed: ${error instanceof Error ? error.message : error}`);
      return {
        status: 'SEED_ERROR',
        message: 'Super Admin sync failed',
      };
    }
  }

  /**
   * Helper function to compare a plain password with a stored password.
   * Supports standard bcrypt hashes ($2a$, $2b$, $2y$) and includes a safe
   * automatic migration upgrade for legacy plaintext records.
   */
  private async verifyPasswordAndUpgrade(
    plainPassword: string,
    storedHashOrPlain: string | null | undefined,
    userId: string,
    userEmail: string,
  ): Promise<boolean> {
    if (!storedHashOrPlain) {
      await bcrypt.compare(plainPassword, DUMMY_BCRYPT_HASH);
      return false;
    }

    const isBcrypt =
      storedHashOrPlain.startsWith('$2a$') ||
      storedHashOrPlain.startsWith('$2b$') ||
      storedHashOrPlain.startsWith('$2y$');

    if (isBcrypt) {
      return bcrypt.compare(plainPassword, storedHashOrPlain);
    }

    // Legacy plaintext password compatibility check
    const matchesLegacy = plainPassword === storedHashOrPlain;
    if (matchesLegacy) {
      // Automatically upgrade legacy plaintext password to bcrypt hash in DB
      try {
        const upgradedHash = await bcrypt.hash(plainPassword, 10);
        await this.prisma.user.update({
          where: { id: userId },
          data: { password: upgradedHash },
        });
        this.logger.log(`Successfully upgraded legacy plaintext password to bcrypt hash for user: ${userEmail}`);
      } catch (err) {
        this.logger.error(`Failed to upgrade legacy password for user: ${userEmail}`, err);
      }
      return true;
    }

    return false;
  }

  async validateAdminLogin(dto: AdminLoginDto) {
    const inputEmail = dto.email?.trim().toLowerCase();
    const inputPassword = dto.password;

    if (!inputEmail || !inputPassword) {
      throw new BadRequestException('Email and password are required');
    }

    const isSuperAdminAlias = ADMIN_ALIASES.includes(inputEmail);

    // Query user record from PostgreSQL
    const user = await this.prisma.user.findFirst({
      where: isSuperAdminAlias
        ? { email: { in: ADMIN_ALIASES, mode: 'insensitive' } }
        : { email: { equals: inputEmail, mode: 'insensitive' } },
    });

    // Check that user exists, has an admin role, and has a password
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') || !user.password) {
      await bcrypt.compare(inputPassword, DUMMY_BCRYPT_HASH);
      throw new UnauthorizedException('Invalid Admin credentials. Please check your email and password.');
    }

    // Verify password against PostgreSQL user's stored hash
    const isPasswordValid = await this.verifyPasswordAndUpgrade(
      inputPassword,
      user.password,
      user.id,
      user.email,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Admin credentials. Please check your email and password.');
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      this.getJwtSecret(),
      { expiresIn: '7d' },
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      permissions: ['ALL_ACCESS', 'PRODUCTS_MANAGE', 'ENQUIRIES_MANAGE', 'ORDERS_MANAGE', 'SETTINGS_MANAGE'],
    };
  }

  async customerLogin(dto: CustomerLoginDto) {
    const inputEmail = dto.email?.trim().toLowerCase();
    const inputPassword = dto.password;

    if (!inputEmail || !inputPassword) {
      throw new BadRequestException('Email and password are required');
    }

    const isSuperAdminAlias = ADMIN_ALIASES.includes(inputEmail);

    // Retrieve user record from PostgreSQL by email (case-insensitive)
    const user = await this.prisma.user.findFirst({
      where: isSuperAdminAlias
        ? { email: { in: ADMIN_ALIASES, mode: 'insensitive' } }
        : { email: { equals: inputEmail, mode: 'insensitive' } },
    });

    // If user does not exist, reject with 401
    if (!user) {
      await bcrypt.compare(inputPassword, DUMMY_BCRYPT_HASH);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Remediation path for orphan accounts from earlier auto-register bug that have no password:
    // If the account has password: null, set their password securely on first login so they can access their account
    if (!user.password) {
      if (inputPassword.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long.');
      }
      const newHash = await bcrypt.hash(inputPassword, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
      this.logger.log(`Remediated orphan account with new secure password hash: ${user.email}`);
      user.password = newHash;
    }

    // Verify password against stored password hash
    const isPasswordValid = await this.verifyPasswordAndUpgrade(
      inputPassword,
      user.password,
      user.id,
      user.email,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      this.getJwtSecret(),
      { expiresIn: '7d' },
    );

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER'].includes(user.role);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...(isAdmin
        ? {
            permissions: [
              'ALL_ACCESS',
              'PRODUCTS_MANAGE',
              'ENQUIRIES_MANAGE',
              'ORDERS_MANAGE',
              'SETTINGS_MANAGE',
            ],
          }
        : {}),
    };
  }

  async customerRegister(dto: CustomerRegisterDto) {
    const inputEmail = dto.email?.trim().toLowerCase();
    const inputPassword = dto.password;
    const inputName = dto.name?.trim();

    if (!inputEmail || !inputPassword || !inputName) {
      throw new BadRequestException('Name, email, and password are required');
    }

    const existing = await this.prisma.user.findFirst({
      where: { email: { equals: inputEmail, mode: 'insensitive' } },
    });

    if (existing && existing.password) {
      throw new BadRequestException(`An account with email '${inputEmail}' already exists. Please log in.`);
    }

    // Securely hash password with bcrypt before writing to PostgreSQL
    const hashedPassword = await bcrypt.hash(inputPassword, 10);

    let user;
    if (existing && !existing.password) {
      user = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          name: inputName,
          password: hashedPassword,
        },
      });
      this.logger.log(`Completed registration for orphan account: ${user.email}`);
    } else {
      user = await this.prisma.user.create({
        data: {
          name: inputName,
          email: inputEmail,
          password: hashedPassword,
          role: 'CUSTOMER',
        },
      });
      this.logger.log(`New customer registered: ${user.email} (${user.name})`);
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      this.getJwtSecret(),
      { expiresIn: '7d' },
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: 'Account created successfully',
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(dto: CreateAdminUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (existing) {
      throw new BadRequestException(`User with email '${dto.email}' already exists.`);
    }

    const rawPassword = dto.password || this.getAdminCredentials().password;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        password: hashedPassword,
        role: (dto.role as any) || 'ADMIN',
        department: dto.department || 'Operations',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot delete Super Admin account.');
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
