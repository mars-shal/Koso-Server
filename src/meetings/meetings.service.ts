import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import { CreateMeetingDto } from './dto/create-meeting.dto.js';
import { UpdateMeetingDto } from './dto/update-meeting.dto.js';

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);

  async create(dto: CreateMeetingDto) {
    try {
      const { error } = await supabase
        .from('meetings')
        .upsert({
          client_id: dto.clientId,
          project_id: dto.projectId,
          date: dto.date,
          summary: dto.summary,
          duration: dto.duration,
        });

      if (error) {
        this.logger.error(`Create meeting failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Meeting created for client: ${dto.clientId}`);
      return { success: true, clientId: dto.clientId, date: dto.date };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create meeting error: ${error}`);
      throw new BadRequestException('Failed to create meeting');
    }
  }

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select();

      if (error) {
        this.logger.error(`Fetch meetings failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch meetings error: ${error}`);
      throw new BadRequestException('Failed to fetch meetings');
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Fetch meeting failed: ${error.message}`);
        throw new NotFoundException(`Meeting with id ${id} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Fetch meeting error: ${error}`);
      throw new BadRequestException('Failed to fetch meeting');
    }
  }

  async findByClientId(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select()
        .eq('client_id', clientId);

      if (error) {
        this.logger.error(`Fetch meetings by client failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch meetings by client error: ${error}`);
      throw new BadRequestException('Failed to fetch meetings');
    }
  }

  async update(id: string, dto: UpdateMeetingDto) {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({
          client_id: dto.clientId,
          project_id: dto.projectId,
          date: dto.date,
          summary: dto.summary,
          duration: dto.duration,
        })
        .eq('id', id);

      if (error) {
        this.logger.error(`Update meeting failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Meeting updated: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Update meeting error: ${error}`);
      throw new BadRequestException('Failed to update meeting');
    }
  }

  async remove(id: string) {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error(`Delete meeting failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Meeting deleted: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Delete meeting error: ${error}`);
      throw new BadRequestException('Failed to delete meeting');
    }
  }
}
