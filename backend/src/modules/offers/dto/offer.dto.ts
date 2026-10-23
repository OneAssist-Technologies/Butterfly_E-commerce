import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsDateString,
} from 'class-validator';

export enum DiscountTypeEnum {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(DiscountTypeEnum)
  discountType!: DiscountTypeEnum;

  @IsNumber()
  @Min(1)
  discountValue!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsString()
  @IsOptional()
  offerType?: string;

  @IsString()
  @IsOptional()
  badgeColor?: string;

  @IsBoolean()
  @IsOptional()
  applyAutomatically?: boolean;

  @IsBoolean()
  @IsOptional()
  stackable?: boolean;

  @IsString()
  @IsOptional()
  targetProducts?: string;

  @IsNumber()
  @IsOptional()
  maxUsageLimit?: number;

  @IsNumber()
  @IsOptional()
  usagePerCustomer?: number;

  @IsString()
  @IsOptional()
  termsConditions?: string;

  @IsOptional()
  configuration?: any;

  @IsString()
  @IsOptional()
  bannerText?: string;

  @IsBoolean()
  @IsOptional()
  showInAnnouncement?: boolean;

  @IsBoolean()
  @IsOptional()
  showInHomepage?: boolean;

  @IsString()
  @IsOptional()
  applicableSize?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateOfferDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountTypeEnum)
  @IsOptional()
  discountType?: DiscountTypeEnum;

  @IsNumber()
  @IsOptional()
  @Min(1)
  discountValue?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsString()
  @IsOptional()
  offerType?: string;

  @IsString()
  @IsOptional()
  badgeColor?: string;

  @IsBoolean()
  @IsOptional()
  applyAutomatically?: boolean;

  @IsBoolean()
  @IsOptional()
  stackable?: boolean;

  @IsString()
  @IsOptional()
  targetProducts?: string;

  @IsNumber()
  @IsOptional()
  maxUsageLimit?: number;

  @IsNumber()
  @IsOptional()
  usagePerCustomer?: number;

  @IsString()
  @IsOptional()
  termsConditions?: string;

  @IsOptional()
  configuration?: any;

  @IsString()
  @IsOptional()
  bannerText?: string;

  @IsBoolean()
  @IsOptional()
  showInAnnouncement?: boolean;

  @IsBoolean()
  @IsOptional()
  showInHomepage?: boolean;

  @IsString()
  @IsOptional()
  applicableSize?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsNumber()
  @Min(0)
  orderAmount!: number;

  @IsString()
  @IsOptional()
  productSize?: string;
}
