import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  async create(dto: CreateProjectDto) {
    try {
      const { error } = await supabase
        .from('projects')
        .upsert({
          client_id: dto.clientId,
          name: dto.name,
          description: dto.description,
          status: dto.status,
          agreed_amount: dto.agreedAmount,
          paid_amount: dto.paidAmount,
          start_date: dto.startDate,
          end_date: dto.endDate,
        });

      if (error) {
        this.logger.error(`Create project failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Project created: ${dto.name}`);
      return { success: true, name: dto.name };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create project error: ${error}`);
      throw new BadRequestException('Failed to create project');
    }
  }

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select();

      if (error) {
        this.logger.error(`Fetch projects failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch projects error: ${error}`);
      throw new BadRequestException('Failed to fetch projects');
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Fetch project failed: ${error.message}`);
        throw new NotFoundException(`Project with id ${id} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Fetch project error: ${error}`);
      throw new BadRequestException('Failed to fetch project');
    }
  }

  async findByClientId(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select()
        .eq('client_id', clientId);

      if (error) {
        this.logger.error(`Fetch projects by client failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch projects by client error: ${error}`);
      throw new BadRequestException('Failed to fetch projects');
    }
  }

  async update(id: string, dto: UpdateProjectDto) {
    try {
      const { error } = await supabase
        .from('projects')
        .upsert({
          id,
          client_id: dto.clientId,
          name: dto.name,
          description: dto.description,
          status: dto.status,
          agreed_amount: dto.agreedAmount,
          paid_amount: dto.paidAmount,
          start_date: dto.startDate,
          end_date: dto.endDate,
        });

      if (error) {
        this.logger.error(`Update project failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Project updated: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Update project error: ${error}`);
      throw new BadRequestException('Failed to update project');
    }
  }

  async remove(id: string) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error(`Delete project failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Project deleted: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Delete project error: ${error}`);
      throw new BadRequestException('Failed to delete project');
    }
  }
}
