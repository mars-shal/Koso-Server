import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import { applySuccessfulPayment } from '../database/payment-link-accounting.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  async create(dto: CreateTransactionDto) {
    try {
      const { error } = await supabase
        .from('transactions')
        .upsert({
          payment_link_id: dto.paymentLinkId,
          payer_name: dto.payerName,
          payer_email: dto.payerEmail,
          amount: dto.amount,
          currency: dto.currency,
          date: dto.date,
          status: dto.status,
          gateway_ref: dto.gatewayRef,
        });

      if (error) {
        this.logger.error(`Create transaction failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      // Manual mark-paid: a Succeeded transaction flips the linked link to 'Paid'
      // and bumps its paid_amount.
      if (dto.status === 'Succeeded' && dto.paymentLinkId) {
        const paid = await applySuccessfulPayment(dto.paymentLinkId, dto.amount);
        this.logger.log(
          `mark-paid for link ${dto.paymentLinkId}: matched=${paid.matched} updated=${paid.updated} paidAmount=${paid.paidAmount ?? 'n/a'}`,
        );
      }

      this.logger.log(`Transaction created: ${dto.gatewayRef}`);
      return { success: true, gatewayRef: dto.gatewayRef };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create transaction error: ${error}`);
      throw new BadRequestException('Failed to create transaction');
    }
  }

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select();

      if (error) {
        this.logger.error(`Fetch transactions failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch transactions error: ${error}`);
      throw new BadRequestException('Failed to fetch transactions');
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Fetch transaction failed: ${error.message}`);
        throw new NotFoundException(`Transaction with id ${id} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Fetch transaction error: ${error}`);
      throw new BadRequestException('Failed to fetch transaction');
    }
  }

  async findByPaymentLinkId(paymentLinkId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select()
        .eq('payment_link_id', paymentLinkId);

      if (error) {
        this.logger.error(`Fetch transactions by payment link failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch transactions by payment link error: ${error}`);
      throw new BadRequestException('Failed to fetch transactions');
    }
  }

  async findByStatus(status: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select()
        .eq('status', status);

      if (error) {
        this.logger.error(`Fetch transactions by status failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch transactions by status error: ${error}`);
      throw new BadRequestException('Failed to fetch transactions');
    }
  }

  async update(id: string, dto: UpdateTransactionDto) {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          payment_link_id: dto.paymentLinkId,
          payer_name: dto.payerName,
          payer_email: dto.payerEmail,
          amount: dto.amount,
          currency: dto.currency,
          date: dto.date,
          status: dto.status,
          gateway_ref: dto.gatewayRef,
        })
        .eq('id', id);

      if (error) {
        this.logger.error(`Update transaction failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Transaction updated: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Update transaction error: ${error}`);
      throw new BadRequestException('Failed to update transaction');
    }
  }

  async remove(id: string) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error(`Delete transaction failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Transaction deleted: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Delete transaction error: ${error}`);
      throw new BadRequestException('Failed to delete transaction');
    }
  }
}
