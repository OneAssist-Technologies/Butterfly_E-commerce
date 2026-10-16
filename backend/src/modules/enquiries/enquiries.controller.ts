import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnquiriesService } from './enquiries.service.js';
import { CreateEnquiryDto, UpdateEnquiryStatusDto } from './dto/enquiry.dto.js';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  async getAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.enquiriesService.findAll({ status, search });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.enquiriesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEnquiryDto) {
    return this.enquiriesService.create(dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEnquiryStatusDto,
  ) {
    return this.enquiriesService.updateStatus(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.enquiriesService.remove(id);
  }
}
