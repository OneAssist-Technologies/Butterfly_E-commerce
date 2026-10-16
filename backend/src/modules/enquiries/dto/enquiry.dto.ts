import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateEnquiryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsNotEmpty()
  productModel!: string;

  @IsString()
  @IsOptional()
  productPrice?: string;
}

export class UpdateEnquiryStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: 'New' | 'Contacted' | 'Closed';
}
