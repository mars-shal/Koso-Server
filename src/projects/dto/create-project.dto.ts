export class CreateProjectDto {
  clientId: string;
  name: string;
  description: string;
  status: string;
  agreedAmount: number;
  paidAmount: number;
  startDate: string;
  endDate: string;
}
