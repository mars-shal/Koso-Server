export class CreatePaymentPageDto {
  name: string;
  amount: number;
  description: string;
}

export class CreatePaymentRequestDto {
  amount: number;
  description: string;
  customerId: string;
  dueDate: string;
  sendNotification?: boolean;
}

export class CreateCustomerDto {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}
