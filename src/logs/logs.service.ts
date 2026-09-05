import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import { CreateLogDto } from './dto/create-log.dto.js';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  async create(dto: CreateLogDto) {
    try {
      const { error } = await supabase
        .from('logs')
        .upsert({
          client_id: dto.clientId,
          project_id: dto.projectId,
          type: dto.type,
          message: dto.message,
          timestamp: dto.timestamp,
        });

      if (error) {
        this.logger.error(`Create log failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Log created for client: ${dto.clientId}`);
      return { success: true, clientId: dto.clientId, type: dto.type };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create log error: ${error}`);
      throw new BadRequestException('Failed to create log');
    }
  }

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select();

      if (error) {
        this.logger.error(`Fetch logs failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch logs error: ${error}`);
      throw new BadRequestException('Failed to fetch logs');
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Fetch log failed: ${error.message}`);
        throw new NotFoundException(`Log with id ${id} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Fetch log error: ${error}`);
      throw new BadRequestException('Failed to fetch log');
    }
  }

  async findByClientId(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select()
        .eq('client_id', clientId);

      if (error) {
        this.logger.error(`Fetch logs by client failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch logs by client error: ${error}`);
      throw new BadRequestException('Failed to fetch logs');
    }
  }

  async remove(id: string) {
    try {
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error(`Delete log failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Log deleted: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Delete log error: ${error}`);
      throw new BadRequestException('Failed to delete log');
    }
  }
}
