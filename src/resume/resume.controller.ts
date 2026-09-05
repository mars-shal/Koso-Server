import { Controller, Post, Body } from '@nestjs/common';
import { ResumeService } from './resume.service.js';
import { BuildResumeDto } from './dto/build-resume.dto.js';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  /** POST /resume — build an ATS-optimized resume from all koso projects. */
  @Post()
  build() {
    return this.resumeService.build();
  }

  /** POST /resume/score — re-score an existing resume markdown. */
  @Post('score')
  score(@Body() dto: BuildResumeDto) {
    return this.resumeService.score(dto.resumeText ?? '');
  }
}
