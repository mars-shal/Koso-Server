import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import { CreateMilestoneDto } from './dto/create-milestone.dto.js';
import { UpdateMilestoneDto } from './dto/update-milestone.dto.js';

@Injectable()
export class MilestonesService {
  private readonly logger = new Logger(MilestonesService.name);

  async create(dto: CreateMilestoneDto) {
    try {
      const { error } = await supabase
        .from('milestones')
        .upsert({
          project_id: dto.projectId,
          name: dto.name,
          due_date: dto.dueDate,
          status: dto.status,
          description: dto.description,
        });

      if (error) {
        this.logger.error(`Create milestone failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Milestone created: ${dto.name}`);
      return { success: true, name: dto.name };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create milestone error: ${error}`);
      throw new BadRequestException('Failed to create milestone');
    }
  }

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select();

      if (error) {
        this.logger.error(`Fetch milestones failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch milestones error: ${error}`);
      throw new BadRequestException('Failed to fetch milestones');
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Fetch milestone failed: ${error.message}`);
        throw new NotFoundException(`Milestone with id ${id} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Fetch milestone error: ${error}`);
      throw new BadRequestException('Failed to fetch milestone');
    }
  }

  async findByProjectId(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select()
        .eq('project_id', projectId);

      if (error) {
        this.logger.error(`Fetch milestones by project failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch milestones by project error: ${error}`);
      throw new BadRequestException('Failed to fetch milestones');
    }
  }

  async update(id: string, dto: UpdateMilestoneDto) {
    try {
      const { error } = await supabase
        .from('milestones')
        .upsert({
          id,
          project_id: dto.projectId,
          name: dto.name,
          due_date: dto.dueDate,
          status: dto.status,
          description: dto.description,
        });

      if (error) {
        this.logger.error(`Update milestone failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Milestone updated: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Update milestone error: ${error}`);
      throw new BadRequestException('Failed to update milestone');
    }
  }

  async remove(id: string) {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error(`Delete milestone failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Milestone deleted: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Delete milestone error: ${error}`);
      throw new BadRequestException('Failed to delete milestone');
    }
  }
}
