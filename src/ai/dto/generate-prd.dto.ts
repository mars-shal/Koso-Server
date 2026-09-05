export class GeneratePrdDto {
  /** Project or feature name to generate a PRD for. */
  name: string;
  /** High-level description / scope. Optional — falls back to project data. */
  description?: string;
  /** Optional project id to pull milestones/meetings from. */
  projectId?: string;
}
