import { Controller, Post, Body, Logger, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import { AiService } from './ai.service.js';
import { GeneratePrdDto } from './dto/generate-prd.dto.js';
import { GeneratePricingDto } from './dto/generate-pricing.dto.js';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/prd
   * Generate a Product Requirements Document. Optionally enriches with the
   * project's milestones when a projectId is supplied.
   */
  @Post('prd')
  async generatePrd(@Body() dto: GeneratePrdDto) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('PRD name is required');
    }

    let milestoneContext = '';
    if (dto.projectId) {
      const { data, error } = await supabase
        .from('Milestones')
        .select()
        .eq('project_id', dto.projectId);
      if (error) {
        this.logger.error(`Fetch milestones for PRD failed: ${error.message}`);
      } else if (data && data.length) {
        milestoneContext = `\n\nKnown milestones:\n${data
          .map((m) => `- ${String(m.title ?? m.name ?? '')}: ${String(m.description ?? '')}`)
          .join('\n')}`;
      }
    }

    const prompt = `Generate a detailed Product Requirements Document (PRD) for the following.
Name: ${dto.name}
Description/scope: ${dto.description || 'N/A'}
${milestoneContext}

Structure the PRD with: Overview, Goals & Non-Goals, Target Users, User Stories, Functional Requirements, Non-Functional Requirements, Milestones, Success Metrics, and Risks/Open Questions. Use markdown.`;

    const prd = await this.aiService.chat(prompt, {
      system:
        'You are a senior product manager. Write clear, complete, implementation-ready PRDs in markdown.',
      maxOutputTokens: 4096,
    });

    return { name: dto.name, prd };
  }

  /**
   * POST /ai/pricing
   * Suggest a price for a piece of work based on its description/scope.
   */
  @Post('pricing')
  async generatePricing(@Body() dto: GeneratePricingDto) {
    if (!dto.description || !dto.description.trim()) {
      throw new BadRequestException('Work description is required');
    }

    const prompt = `Suggest a fair price (quote) for the following freelance work.
Scope: ${dto.description}
Client type: ${dto.clientType || 'unknown'}
Currency: ${dto.currency || 'NGN'}

Return JSON with:
{
  "currency": string,
  "price_min": number,
  "price_max": number,
  "recommended_price": number,
  "rate_hourly": number | null,
  "explanation": string,
  "assumptions": string[]
}`;

    const result = await this.aiService.structuredJson<Record<string, unknown>>(prompt, {
      system:
        'You are an experienced freelance pricing consultant familiar with the local (Nigerian) market. Price in the requested currency. Be realistic and justify your range. Respond with valid JSON only.',
      temperature: 0.3,
      maxOutputTokens: 1024,
    });

    return result;
  }
}
