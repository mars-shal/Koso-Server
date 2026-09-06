import axios from "axios";
import { Logger } from "@nestjs/common";

export interface PaymentPage {
  name: string;
  amount: number;
  description: string;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  customerId: string;
  dueDate: string;
  sendNotification?: boolean;
}

export interface Customer {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export class PaymentUtility {
  private logger = new Logger(PaymentUtility.name);
  private GateWay_Url: string = "https://api.paystack.co/";

  private async makeRequest(url: string, method: string, data?: any): Promise<any> {
    try {
      const response = await axios({
        url: `${this.GateWay_Url}${url}`,
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        method,
        data,
      });
      this.logger.log("Request successful");
      return response.data;
    } catch (error) {
      this.logger.error(`error: ${error}`);
      throw error;
    }
  }

  public async paymentPage(paymentPage: PaymentPage): Promise<any> {
    const { name, amount, description } = paymentPage;
    const body: Record<string, unknown> = { name, description };
    if (amount) body.amount = amount;
    const response = await this.makeRequest("page", "POST", body);
    if (response.data) {
      const slug = response?.data?.slug;
      this.logger.log(`Payment page created: ${slug}`);
      return slug;
    }
    this.logger.error("Failed to create payment page");
    return null;
  }

  public async paymentRequests(paymentRequest: PaymentRequest): Promise<any> {
    const { amount, description, customerId, dueDate, sendNotification } = paymentRequest;
    const body: Record<string, unknown> = {
      amount,
      description,
      customer: customerId,
      send_notification: sendNotification ?? true,
    };
    if (dueDate) body.due_date = dueDate;
    const response = await this.makeRequest("paymentrequest", "POST", body);
    if (response.data) {
      this.logger.log("Payment request created");
      return response.data;
    }
    this.logger.error("Failed to create payment request");
    return null;
  }

  public async createCustomer(customer: Customer): Promise<any> {
    const { email, first_name, last_name, phone } = customer;
    const response = await this.makeRequest("customer", "POST", { email, first_name, last_name, phone });
    if (response.data) {
      this.logger.log("Customer created");
      return response.data;
    }
    this.logger.error("Failed to create customer");
    return null;
  }

  public async listCustomers(): Promise<any> {
    const response = await this.makeRequest("customer", "GET");
    if (response.data) {
      this.logger.log("Customers listed");
      return response.data;
    }
    this.logger.error("Failed to list customers");
    return null;
  }

  public async getTransactions(): Promise<any> {
    const response = await this.makeRequest("transaction", "GET");
    if (response.data) {
      this.logger.log("Transactions listed");
      return response.data;
    }
    this.logger.error("Failed to list transactions");
    return null;
  }

  public async fetchTransaction(transactionId: string): Promise<any> {
    const response = await this.makeRequest(`transaction/${transactionId}`, "GET");
    if (response.data) {
      this.logger.log("Transaction fetched");
      return response.data;
    }
    this.logger.error("Failed to fetch transaction");
    return null;
  }
}

export default PaymentUtility;
