export class CreateDocumentDto {
  clientId: string;
  projectId?: string;
  name: string;
  type: 'NDA' | 'Agreement' | 'PRD' | 'Terms' | 'Receipt' | 'Other';
  signed: 'Signed' | 'Pending' | 'N/A';
  fileUrl?: string;
}
