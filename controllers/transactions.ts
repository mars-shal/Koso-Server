import { Database } from '../model/database';
import { logger } from '../utils/logger';

export interface Transaction {
  id?: string;
  paymentLinkId: string;
  payerName?: string;
  payerEmail?: string;
  amount: number;
  currency: string;
  date: string;
  status: 'Succeeded' | 'Pending' | 'Failed' | 'Refunded';
  gatewayRef: string;
}

class TransactionController {
  private db: Database = new Database();

  public async createTransaction(transaction: Transaction) {
    try {
      const res = await this.db.insert({
        table: 'Transactions',
        data: {
          payment_link_id: transaction.paymentLinkId,
          payer_name: transaction.payerName,
          payer_email: transaction.payerEmail,
          amount: transaction.amount,
          currency: transaction.currency,
          date: transaction.date,
          status: transaction.status,
          gateway_ref: transaction.gatewayRef,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async updateTransaction(transaction: Transaction) {
    try {
      const res = await this.db.insert({
        table: 'Transactions',
        data: {
          id: transaction.id,
          payment_link_id: transaction.paymentLinkId,
          payer_name: transaction.payerName,
          payer_email: transaction.payerEmail,
          amount: transaction.amount,
          currency: transaction.currency,
          date: transaction.date,
          status: transaction.status,
          gateway_ref: transaction.gatewayRef,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async deleteTransaction(transaction: Transaction) {
    try {
      const res = await this.db.delete({
        table: 'Transactions',
        data: {
          id: transaction.id,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getTransaction(transaction: Transaction) {
    try {
      const res = await this.db.read({
        table: 'Transactions',
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getAllTransactions() {
    try {
      const res = await this.db.read({
        table: 'Transactions',
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getTransactionsByPaymentLinkId(paymentLinkId: string) {
    try {
      const res = await this.db.read({
        table: 'Transactions',
        data: { payment_link_id: paymentLinkId },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }
}

export default TransactionController;
