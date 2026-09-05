export interface DatabaseSchema {
  table: string;
  data?: Record<string, unknown>;
}

export interface StorageSchema {
  bucket: string;
  path: string;
  fileData?: string;
  contentType?: string;
}

export interface Llm {
  prompt: string;
}

export interface PaymentPage {
  name: string,
  amount: number,
  description: string,
}

export interface PaymentRequest {
  amount: number,
  description: string,
  customerId: string,
  dueDate: string,
  sendNotification?: boolean,
}

export interface Customer {
  email: string,
  first_name: string,
  last_name: string,
  phone: string,
}

export interface Client {
  email: string,
  first_name: string,
  last_name: string,
  phone: string,
}

