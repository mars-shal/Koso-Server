import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import PaymentUtility from '../database/payment-utility.js';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto.js';
import { UpdatePaymentLinkDto } from './dto/update-payment-link.dto.js';

const FALLBACK_CUSTOMER_EMAIL = 'koso+ietorobong@gmail.com';

@Injectable()
export class PaymentLinksService {
  private readonly logger = new Logger(PaymentLinksService.name);
  private readonly paystack = new PaymentUtility();

  async create(dto: CreatePaymentLinkDto) {
    try {
      const url = await this.buildPaymentUrl(dto);

      const { error } = await supabase
        .from('paymentlinks')
        .upsert({
          type: dto.type,
          linked_client_id: dto.linkedClientId,
          linked_project_id: dto.linkedProjectId,
          linked_label: dto.linkedLabel,
          amount: dto.amount,
          currency: dto.currency,
          status: dto.status,
          url,
        });

      if (error) {
        this.logger.error(`Create payment link failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Payment link created: ${dto.linkedLabel}`);
      return { success: true, label: dto.linkedLabel, url };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create payment link error: ${error}`);
      throw new BadRequestException('Failed to create payment link');
    }
  }

  private async buildPaymentUrl(dto: CreatePaymentLinkDto): Promise<string> {
    if (dto.type === 'Invoice') {
      if (!dto.amount || dto.amount <= 0) {
        throw new BadRequestException('Invoice payment links require an amount');
      }

      const client = dto.linkedClientId ? await this.findClient(dto.linkedClientId) : null;
      const customerEmail = client?.email || FALLBACK_CUSTOMER_EMAIL;

      const customer = await this.paystack.createCustomer({
        email: customerEmail,
        first_name: client?.first_name || '',
        last_name: client?.last_name || '',
        phone: client?.phone || '',
      });
      const customerCode = customer?.customer_code;
      if (!customerCode) {
        throw new BadRequestException('Failed to create Paystack customer');
      }

      const paymentRequest = await this.paystack.paymentRequests({
        amount: Math.round(dto.amount * 100),
        description: dto.linkedLabel,
        customerId: customerCode,
        dueDate: '',
        sendNotification: true,
      });
      const requestCode = paymentRequest?.request_code;
      if (!requestCode) {
        throw new BadRequestException('Failed to create Paystack payment request');
      }

      return `https://paystack.com/pay/${requestCode}`;
    }

    const slug = await this.paystack.paymentPage({
      name: dto.linkedLabel,
      amount: dto.amount ? Math.round(dto.amount * 100) : 0,
      description: dto.linkedLabel,
    });
    if (!slug) {
      throw new BadRequestException('Failed to create Paystack payment page');
    }

    return `https://paystack.com/pay/${slug}`;
  }

  private async findClient(emailOrId: string) {
    const { data: byEmail } = await supabase
      .from('clients')
      .select('email, first_name, last_name, phone')
      .eq('email', emailOrId)
      .maybeSingle();
    if (byEmail) return byEmail;

    const { data: byId } = await supabase
      .from('clients')
      .select('email, first_name, last_name, phone')
      .eq('id', emailOrId)
      .maybeSingle();
    return byId;
  }

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('paymentlinks')
        .select();

      if (error) {
        this.logger.error(`Fetch payment links failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch payment links error: ${error}`);
      throw new BadRequestException('Failed to fetch payment links');
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await supabase
        .from('paymentlinks')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Fetch payment link failed: ${error.message}`);
        throw new NotFoundException(`Payment link with id ${id} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Fetch payment link error: ${error}`);
      throw new BadRequestException('Failed to fetch payment link');
    }
  }

  async findByClientId(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('paymentlinks')
        .select()
        .eq('linked_client_id', clientId);

      if (error) {
        this.logger.error(`Fetch payment links by client failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch payment links by client error: ${error}`);
      throw new BadRequestException('Failed to fetch payment links');
    }
  }

  async findByProjectId(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('paymentlinks')
        .select()
        .eq('linked_project_id', projectId);

      if (error) {
        this.logger.error(`Fetch payment links by project failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch payment links by project error: ${error}`);
      throw new BadRequestException('Failed to fetch payment links');
    }
  }

  async findByType(type: string) {
    try {
      const { data, error } = await supabase
        .from('paymentlinks')
        .select()
        .eq('type', type);

      if (error) {
        this.logger.error(`Fetch payment links by type failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch payment links by type error: ${error}`);
      throw new BadRequestException('Failed to fetch payment links');
    }
  }

  async update(id: string, dto: UpdatePaymentLinkDto) {
    try {
      const { error } = await supabase
        .from('paymentlinks')
        .update({
          type: dto.type,
          linked_client_id: dto.linkedClientId,
          linked_project_id: dto.linkedProjectId,
          linked_label: dto.linkedLabel,
          amount: dto.amount,
          currency: dto.currency,
          status: dto.status,
          url: dto.url,
        })
        .eq('id', id);

      if (error) {
        this.logger.error(`Update payment link failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Payment link updated: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Update payment link error: ${error}`);
      throw new BadRequestException('Failed to update payment link');
    }
  }

  async remove(id: string) {
    try {
      const { error } = await supabase
        .from('paymentlinks')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error(`Delete payment link failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Payment link deleted: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Delete payment link error: ${error}`);
      throw new BadRequestException('Failed to delete payment link');
    }
  }
}
