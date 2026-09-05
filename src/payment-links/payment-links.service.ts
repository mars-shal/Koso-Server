import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto.js';
import { UpdatePaymentLinkDto } from './dto/update-payment-link.dto.js';

@Injectable()
export class PaymentLinksService {
  private readonly logger = new Logger(PaymentLinksService.name);

  async create(dto: CreatePaymentLinkDto) {
    try {
      const { error } = await supabase
        .from('PaymentLinks')
        .upsert({
          type: dto.type,
          linked_client_id: dto.linkedClientId,
          linked_project_id: dto.linkedProjectId,
          linked_label: dto.linkedLabel,
          amount: dto.amount,
          currency: dto.currency,
          status: dto.status,
          url: dto.url,
        });

      if (error) {
        this.logger.error(`Create payment link failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Payment link created: ${dto.linkedLabel}`);
      return { success: true, label: dto.linkedLabel };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create payment link error: ${error}`);
      throw new BadRequestException('Failed to create payment link');
    }
  }

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('PaymentLinks')
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
        .from('PaymentLinks')
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
        .from('PaymentLinks')
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
        .from('PaymentLinks')
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
        .from('PaymentLinks')
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
        .from('PaymentLinks')
        .upsert({
          id,
          type: dto.type,
          linked_client_id: dto.linkedClientId,
          linked_project_id: dto.linkedProjectId,
          linked_label: dto.linkedLabel,
          amount: dto.amount,
          currency: dto.currency,
          status: dto.status,
          url: dto.url,
        });

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
        .from('PaymentLinks')
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
