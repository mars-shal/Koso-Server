import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabase } from '../database/supabase.js';
import PaymentUtility from '../database/payment-utility.js';
import { CreatePaymentPageDto, CreatePaymentRequestDto, CreateCustomerDto } from './dto/create-payment.dto.js';

export interface PaystackWebhookData {
  reference?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paid_at?: string;
  created_at?: string;
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  metadata?: Record<string, unknown> | null;
}

export interface PaystackWebhookEvent {
  event: string;
  data?: PaystackWebhookData;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paymentUtility = new PaymentUtility();

  isValidSignature(rawBody: Buffer, signature: string): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    if (!secret || !signature) return false;

    const expected = createHmac('sha512', secret).update(rawBody).digest('hex');
    try {
      const expectedBuf = Buffer.from(expected, 'utf8');
      const signatureBuf = Buffer.from(signature, 'utf8');
      return expectedBuf.length === signatureBuf.length && timingSafeEqual(expectedBuf, signatureBuf);
    } catch {
      return false;
    }
  }

  async handleWebhook(event: PaystackWebhookEvent) {
    const { event: eventType, data } = event;
    const payload = data ?? {};

    switch (eventType) {
      case 'charge.success':
        return this.recordTransaction('Succeeded', payload);
      case 'charge.failed':
        return this.recordTransaction('Failed', payload);
      default:
        this.logger.log(`Unhandled webhook event: ${eventType}`);
        return { success: true, received: eventType };
    }
  }

  private async recordTransaction(status: string, data: PaystackWebhookData) {
    const gatewayRef = data.reference;
    if (!gatewayRef) {
      throw new BadRequestException('Webhook payload missing reference');
    }

    const amount = Math.round(Number(data.amount ?? 0) / 100);
    const payerName = data.customer?.first_name
      ? `${data.customer.first_name} ${data.customer.last_name ?? ''}`.trim()
      : undefined;
    const date = data.paid_at ?? data.created_at ?? new Date().toISOString();
    const paymentLinkId =
      typeof data.metadata?.paymentLinkId === 'string' ? data.metadata.paymentLinkId : null;

    const { data: existing } = await supabase
      .from('Transactions')
      .select('id')
      .eq('gateway_ref', gatewayRef)
      .maybeSingle();

    let error: { message: string } | null;
    if (existing?.id) {
      ({ error } = await supabase
        .from('Transactions')
        .update({ status, amount, date, payer_name: payerName, payer_email: data.customer?.email })
        .eq('id', existing.id));
    } else {
      ({ error } = await supabase.from('Transactions').insert({
        payment_link_id: paymentLinkId,
        payer_name: payerName,
        payer_email: data.customer?.email,
        amount,
        currency: data.currency,
        date,
        status,
        gateway_ref: gatewayRef,
      }));
    }

    if (error) {
      this.logger.error(`Webhook transaction save failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }

    this.logger.log(`Webhook recorded transaction ${gatewayRef} as ${status}`);
    return { success: true, reference: gatewayRef, status };
  }

  async createPaymentPage(dto: CreatePaymentPageDto) {
    try {
      const result = await this.paymentUtility.paymentPage({
        name: dto.name,
        amount: dto.amount,
        description: dto.description,
      });

      if (!result) {
        throw new BadRequestException('Failed to create payment page');
      }

      this.logger.log(`Payment page created: ${result}`);
      return { success: true, slug: result };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create payment page error: ${error}`);
      throw new BadRequestException('Failed to create payment page');
    }
  }

  async createPaymentRequest(dto: CreatePaymentRequestDto) {
    try {
      const result = await this.paymentUtility.paymentRequests({
        amount: dto.amount,
        description: dto.description,
        customerId: dto.customerId,
        dueDate: dto.dueDate,
        sendNotification: dto.sendNotification,
      });

      if (!result) {
        throw new BadRequestException('Failed to create payment request');
      }

      this.logger.log(`Payment request created`);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create payment request error: ${error}`);
      throw new BadRequestException('Failed to create payment request');
    }
  }

  async createCustomer(dto: CreateCustomerDto) {
    try {
      const result = await this.paymentUtility.createCustomer({
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
        phone: dto.phone,
      });

      if (!result) {
        throw new BadRequestException('Failed to create customer');
      }

      this.logger.log(`Customer created: ${dto.email}`);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create customer error: ${error}`);
      throw new BadRequestException('Failed to create customer');
    }
  }

  async listCustomers() {
    try {
      const result = await this.paymentUtility.listCustomers();

      if (!result) {
        throw new BadRequestException('Failed to list customers');
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`List customers error: ${error}`);
      throw new BadRequestException('Failed to list customers');
    }
  }

  async getTransactions() {
    try {
      const result = await this.paymentUtility.getTransactions();

      if (!result) {
        throw new BadRequestException('Failed to get transactions');
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Get transactions error: ${error}`);
      throw new BadRequestException('Failed to get transactions');
    }
  }

  async fetchTransaction(transactionId: string) {
    try {
      const result = await this.paymentUtility.fetchTransaction(transactionId);

      if (!result) {
        throw new BadRequestException('Failed to fetch transaction');
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch transaction error: ${error}`);
      throw new BadRequestException('Failed to fetch transaction');
    }
  }
}
