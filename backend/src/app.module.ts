import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { EnquiriesModule } from './modules/enquiries/enquiries.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    EnquiriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
