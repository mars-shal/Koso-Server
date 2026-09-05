export class CreateLogDto {
  clientId: string;
  projectId?: string;
  type: string;
  message: string;
  timestamp: string;
}
