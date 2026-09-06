export class CreateTransactionDto {
  paymentLinkId: string;
  payerName?: string;
  payerEmail?: string;
  amount: number;
  currency: string;
  date: string;
  status: 'Succeeded' | 'Pending' | 'Failed' | 'Refunded';
  gatewayRef?: string;
}
