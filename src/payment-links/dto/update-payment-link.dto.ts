export class UpdatePaymentLinkDto {
  type?: 'Invoice' | 'Donation';
  linkedClientId?: string;
  linkedProjectId?: string;
  linkedLabel?: string;
  amount?: number;
  currency?: string;
  status?: 'Active' | 'Inactive';
  url?: string;
}
