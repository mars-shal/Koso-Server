import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { PaymentLinksService } from './payment-links.service.js';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto.js';
import { UpdatePaymentLinkDto } from './dto/update-payment-link.dto.js';

@Controller('payment-links')
export class PaymentLinksController {
  constructor(private readonly paymentLinksService: PaymentLinksService) {}

  @Post()
  create(@Body() dto: CreatePaymentLinkDto) {
    return this.paymentLinksService.create(dto);
  }

  @Get()
  findAll(
    @Query('clientId') clientId?: string,
    @Query('projectId') projectId?: string,
    @Query('type') type?: string,
  ) {
    if (clientId) return this.paymentLinksService.findByClientId(clientId);
    if (projectId) return this.paymentLinksService.findByProjectId(projectId);
    if (type) return this.paymentLinksService.findByType(type);
    return this.paymentLinksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentLinksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentLinkDto) {
    return this.paymentLinksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentLinksService.remove(id);
  }
}
