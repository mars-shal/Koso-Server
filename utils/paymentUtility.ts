import axios from "axios";
import { Logger } from "tslog";
import { PaymentPage, PaymentRequest, Customer } from "./types";
const logger = new Logger();


class PaymentUtility {
  private GateWay_Url: string = "https://api.paystack.co/"

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
      logger.info("Request successful", response.data);
      return response.data;
    } catch (error) {
      
      logger.error(`error: ${error}`);
      throw error;
    }
  }

  // This is Use for donations and onetime payments not suitable for invoices
  public async paymentPage(paymentPage: PaymentPage): Promise<any> {
    const { name, amount, description } = paymentPage;
    const body: Record<string, unknown> = { name, description };
    if (amount) body.amount = amount;
    const response = await this.makeRequest("page", "POST", body);
    if (response.data) {
      const slug = response?.data?.slug;
      logger.info("Payment page created", slug);
      return slug;
    }
    logger.error("Failed to create payment page");
    return null;
  }

  //This is used for creating payment requests for invoices 
  public async paymentRequests(paymentRequest: PaymentRequest): Promise<any> {
const { amount, description, customerId, dueDate, sendNotification } = paymentRequest;
    const body: Record<string, unknown> = {
      amount,
      description,
      customer: customerId,
      send_notification: sendNotification ?? false,
    };
    if (dueDate) body.due_date = dueDate;
    const response = await this.makeRequest("paymentrequest", "POST", body);
    if (response.data) {
      logger.info("Payment request created", response.data);
      return response.data;
    }
    logger.error("Failed to create payment request");
    return null;
  }

  public async createCustomer(customer: Customer): Promise<any> {
    const { email, first_name, last_name, phone } = customer;
    const response = await this.makeRequest("customer", "POST", { email, first_name, last_name, phone });
    if (response.data) {
      logger.info("Customer created", response.data);
      return response.data;
    }
    logger.error("Failed to create customer");
    return null;
  }

  public async listCustomers(): Promise<any> {
    const response = await this.makeRequest("customer", "GET");
    if (response.data) {
      logger.info("Customers listed", response.data);
      return response.data;
    }
    logger.error("Failed to list customers");
    return null;
  }

  public async getTransactions(): Promise<any> {
    const response = await this.makeRequest("transaction", "GET");
    if (response.data) {
      logger.info("Transactions listed", response.data);
      return response.data;
    }
    logger.error("Failed to list transactions");
    return null;                                        
  }

  public async fetchTransaction(transactionId: string): Promise<any> {
    const response = await this.makeRequest(`transaction/${transactionId}`, "GET");
    if (response.data) {
      logger.info("Transaction fetched", response.data);
      return response.data;
    }
    logger.error("Failed to fetch transaction");
    return null;
  }
  
}

export default PaymentUtility;