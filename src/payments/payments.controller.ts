import { Controller, Get, Post, Body, Param, Req, UnauthorizedException, BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService, type PaystackWebhookEvent } from './payments.service.js';
import { CreatePaymentPageDto, CreatePaymentRequestDto, CreateCustomerDto } from './dto/create-payment.dto.js';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  webhook(@Req() req: RawBodyRequest) {
    const rawBody = req.rawBody ?? Buffer.from('');
    const signature = String(req.headers['x-paystack-signature'] ?? '');

    if (!this.paymentsService.isValidSignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    let event: PaystackWebhookEvent;
    try {
      event = JSON.parse(rawBody.toString('utf8')) as PaystackWebhookEvent;
    } catch {
      throw new BadRequestException('Invalid webhook payload');
    }

    return this.paymentsService.handleWebhook(event);
  }

  @Post('page')
  createPaymentPage(@Body() dto: CreatePaymentPageDto) {
    return this.paymentsService.createPaymentPage(dto);
  }

  @Post('request')
  createPaymentRequest(@Body() dto: CreatePaymentRequestDto) {
    return this.paymentsService.createPaymentRequest(dto);
  }

  @Post('customer')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.paymentsService.createCustomer(dto);
  }

  @Get('customers')
  listCustomers() {
    return this.paymentsService.listCustomers();
  }

  @Get('transactions')
  getTransactions() {
    return this.paymentsService.getTransactions();
  }

  @Get('transactions/:id')
  fetchTransaction(@Param('id') id: string) {
    return this.paymentsService.fetchTransaction(id);
  }
}
