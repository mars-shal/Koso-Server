import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import { AiService } from '../ai/ai.service.js';
import { scoreResume, type ResumeScore } from './resume.utils.js';

export interface BuildResumeResult {
  resume: string;
  score?: ResumeScore;
  projectCount: number;
}

/**
 * Builds an ATS-optimized resume from the user's koso project data.
 * Fetches all Projects, asks the LLM (Google XYZ format) to write a resume,
 * then scores it with a hybrid LLM + heuristic assessment.
 */
@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(private readonly aiService: AiService) {}

  async build(): Promise<BuildResumeResult> {
    const projects = await this.fetchProjects();
    if (projects.length === 0) {
      throw new BadRequestException('No projects found to build a resume from');
    }

    const projectText = this.serializeProjects(projects);

    const resume = await this.aiService.chat(
      `Write a professional, ATS-friendly developer resume in markdown based on the following projects. Use Google XYZ format for every bullet point ("Accomplished X by doing Y resulting in Z"), quantify achievements where possible, use strong action verbs, standard section headers (Summary, Skills, Experience/Projects, Education placeholder), and keep it to one page.

Projects data:
${projectText}

Output the resume in clean markdown. Do not invent factual numbers — only use what is present, and where a metric is missing, phrase the bullet without fabricating a figure.`,
      {
        system:
          'You are a senior resume writer. Produce clean ATS-compatible markdown only, no explanation.',
        maxOutputTokens: 4096,
      },
    );

    const score = await this.assess(resume);

    this.logger.log(
      `Resume built from ${projects.length} projects — score=${score?.score ?? 'n/a'}`,
    );

    return { resume, score, projectCount: projects.length };
  }

  /** Re-score an existing resume markdown. */
  async score(resumeText: string): Promise<ResumeScore> {
    if (!resumeText || resumeText.trim().length < 20) {
      throw new BadRequestException('No resume text provided');
    }
    const result = await this.assess(resumeText);
    if (!result) {
      throw new BadRequestException('Failed to score resume');
    }
    return result;
  }

  private async fetchProjects(): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase.from('projects').select();

    if (error) {
      this.logger.error(`Fetch projects for resume failed: ${error.message}`);
      throw new BadRequestException('Failed to fetch projects');
    }
    return (data as Record<string, unknown>[]) || [];
  }

  private serializeProjects(projects: Record<string, unknown>[]): string {
    return projects
      .map((p) => {
        return [
          `- Project: ${String(p.name ?? '')}`,
          `  Status: ${String(p.status ?? '')}`,
          `  Description: ${String(p.description ?? '')}`,
          p.agreed_amount
            ? `  Agreed amount: ${String((p.agreed_amount as number).toLocaleString?.() ?? p.agreed_amount)}`
            : null,
          p.start_date ? `  Start: ${String(p.start_date)}` : null,
          p.end_date ? `  End: ${String(p.end_date)}` : null,
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n\n');
  }

  /** Hybrid assessment — LLM qualitative judgment + deterministic heuristic. */
  private async assess(resume: string): Promise<ResumeScore | undefined> {
    const heuristic = scoreResume(resume);

    try {
      const llmScore = await this.aiService.structuredJson<{
        score: number;
        summary: string;
        issues: { category: 'ats' | 'content' | 'format' | 'completeness'; severity: 'high' | 'medium' | 'low'; description: string }[];
        suggestions: string[];
      }>(
        `You are an ATS resume analyzer. Score this resume from 0 to 100.
Criteria:
- ATS compatibility: standard section headers, no tables/columns, clean formatting
- Content quality: quantifiable achievements, action verbs, Google XYZ format
- Completeness: contact info, summary, skills, experience, education
- Conciseness: one page, no fluff

Resume:
${resume.slice(0, 6000)}

Return JSON:
- score: number (0-100)
- summary: string
- issues: array of { category: "ats"|"content"|"format"|"completeness", severity: "high"|"medium"|"low", description: string }
- suggestions: string[]`,
        { temperature: 0.1, maxOutputTokens: 2048 },
      );

      const W_LLM = 0.5;
      const W_ATS = 0.5;
      const combined = Math.round(W_LLM * llmScore.score + W_ATS * heuristic.score);

      const merged = {
        score: combined,
        summary: llmScore.summary || heuristic.summary,
        issues: [...(llmScore.issues ?? []), ...heuristic.issues],
        suggestions: [...new Set([...(llmScore.suggestions ?? []), ...heuristic.suggestions])],
      };
      return merged;
    } catch (error) {
      this.logger.warn(`LLM resume scoring failed (non-fatal): ${String(error)}`);
      return heuristic;
    }
  }
}
