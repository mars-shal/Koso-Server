export class CreateMeetingDto {
  clientId: string;
  projectId?: string;
  date: string;
  summary: string;
  duration?: string;
}
