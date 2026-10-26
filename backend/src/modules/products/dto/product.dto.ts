import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsNumber()
  @IsOptional()
  priceNumber?: number;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  size!: string;

  @IsString()
  @IsOptional()
  screenSizeCategory?: string;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsString()
  @IsNotEmpty()
  image!: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsNotEmpty()
  resolution!: string;

  @IsString()
  @IsOptional()
  resolutionCategory?: string;

  @IsString()
  @IsNotEmpty()
  os!: string;

  @IsString()
  @IsOptional()
  smartOS?: string;

  @IsString()
  @IsOptional()
  smartCategory?: string;

  @IsString()
  @IsNotEmpty()
  sound!: string;

  @IsString()
  @IsOptional()
  displayTech?: string;

  @IsString()
  @IsNotEmpty()
  price!: string;

  @IsNumber()
  @IsNotEmpty()
  numericPrice!: number;

  @IsString()
  @IsOptional()
  priceCategory?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsBoolean()
  @IsOptional()
  isFilledButton?: boolean;

  @IsString()
  @IsOptional()
  buttonLabel?: string;

  @IsNumber()
  @IsOptional()
  featuredRank?: number;

  @IsBoolean()
  @IsOptional()
  isTopSelling?: boolean;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsArray()
  @IsOptional()
  features?: string[];

  @IsArray()
  @IsOptional()
  keyFeatures?: string[];

  @IsOptional()
  technicalSpecs?: any;

  @IsString()
  @IsOptional()
  warrantyInstallation?: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsNumber()
  @IsOptional()
  priceNumber?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsNumber()
  @IsOptional()
  numericPrice?: number;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsBoolean()
  @IsOptional()
  isTopSelling?: boolean;

  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  sound?: string;

  @IsString()
  @IsOptional()
  displayTech?: string;

  @IsString()
  @IsOptional()
  smartOS?: string;

  @IsArray()
  @IsOptional()
  keyFeatures?: string[];

  @IsOptional()
  technicalSpecs?: any;

  @IsString()
  @IsOptional()
  warrantyInstallation?: string;
}

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  rating!: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  comment!: string;
}

