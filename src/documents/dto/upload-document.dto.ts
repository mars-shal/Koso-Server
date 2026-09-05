export class UploadDocumentDto {
  clientId: string;
  projectId?: string;
  name: string;
  type: 'NDA' | 'Agreement' | 'PRD' | 'Terms' | 'Receipt' | 'Other';
  signed?: 'Signed' | 'Pending' | 'N/A';
  fileData: string;
  fileName?: string;
  contentType?: string;
  bucket?: string;
}