export class CreateMilestoneDto {
  projectId: string;
  name: string;
  dueDate: string;
  status: 'complete' | 'incomplete';
  description?: string;
}
