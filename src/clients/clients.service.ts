import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  async create(dto: CreateClientDto) {
    try {
      const { error } = await supabase
        .from('clients')
        .upsert({
          email: dto.email,
          first_name: dto.first_name,
          last_name: dto.last_name,
          phone: dto.phone,
          type: dto.type,
          status: dto.status,
        });

      if (error) {
        this.logger.error(`Create client failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Client created: ${dto.email}`);
      return { success: true, email: dto.email };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create client error: ${error}`);
      throw new BadRequestException('Failed to create client');
    }
  }

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select();

      if (error) {
        this.logger.error(`Fetch clients failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch clients error: ${error}`);
      throw new BadRequestException('Failed to fetch clients');
    }
  }

  async findOne(email: string) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select()
        .eq('email', email)
        .single();

      if (error) {
        this.logger.error(`Fetch client failed: ${error.message}`);
        throw new NotFoundException(`Client with email ${email} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Fetch client error: ${error}`);
      throw new BadRequestException('Failed to fetch client');
    }
  }

  async update(dto: UpdateClientDto) {
    if (!dto.email) {
      throw new BadRequestException('Email is required for update');
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          first_name: dto.first_name,
          last_name: dto.last_name,
          phone: dto.phone,
          type: dto.type,
          status: dto.status,
        })
        .eq('email', dto.email);

      if (error) {
        this.logger.error(`Update client failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Client updated: ${dto.email}`);
      return { success: true, email: dto.email };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Update client error: ${error}`);
      throw new BadRequestException('Failed to update client');
    }
  }

  async remove(email: string) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('email', email);

      if (error) {
        this.logger.error(`Delete client failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Client deleted: ${email}`);
      return { success: true, email };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Delete client error: ${error}`);
      throw new BadRequestException('Failed to delete client');
    }
  }
}
