import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  AuthService,
  AdminLoginDto,
  CustomerLoginDto,
  CustomerRegisterDto,
  CreateAdminUserDto,
} from './auth.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('seed')
  async seedAdmin() {
    return this.authService.seedSuperAdmin();
  }

  @Post(['admin/login', 'admin-login'])
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.validateAdminLogin(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async customerLogin(@Body() dto: CustomerLoginDto) {
    return this.authService.customerLogin(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async customerRegister(@Body() dto: CustomerRegisterDto) {
    return this.authService.customerRegister(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return {
      authenticated: true,
      user: req.user,
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getUsers() {
    return this.authService.getAllUsers();
  }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createUser(@Body() dto: CreateAdminUserDto) {
    return this.authService.createUser(dto);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
