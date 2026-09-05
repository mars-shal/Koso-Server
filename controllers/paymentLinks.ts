import { Database } from '../model/database';
import { logger } from '../utils/logger';

export interface PaymentLink {
  id?: string;
  type: 'Invoice' | 'Donation';
  linkedClientId?: string;
  linkedProjectId?: string;
  linkedLabel: string;
  amount?: number;
  currency: string;
  status: 'Active' | 'Inactive';
  url: string;
}

class PaymentLinkController {
  private db: Database = new Database();

  public async createPaymentLink(paymentLink: PaymentLink) {
    try {
      const res = await this.db.insert({
        table: 'PaymentLinks',
        data: {
          type: paymentLink.type,
          linked_client_id: paymentLink.linkedClientId,
          linked_project_id: paymentLink.linkedProjectId,
          linked_label: paymentLink.linkedLabel,
          amount: paymentLink.amount,
          currency: paymentLink.currency,
          status: paymentLink.status,
          url: paymentLink.url,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async updatePaymentLink(paymentLink: PaymentLink) {
    try {
      const res = await this.db.insert({
        table: 'PaymentLinks',
        data: {
          id: paymentLink.id,
          type: paymentLink.type,
          linked_client_id: paymentLink.linkedClientId,
          linked_project_id: paymentLink.linkedProjectId,
          linked_label: paymentLink.linkedLabel,
          amount: paymentLink.amount,
          currency: paymentLink.currency,
          status: paymentLink.status,
          url: paymentLink.url,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async deletePaymentLink(paymentLink: PaymentLink) {
    try {
      const res = await this.db.delete({
        table: 'PaymentLinks',
        data: {
          id: paymentLink.id,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getPaymentLink(paymentLink: PaymentLink) {
    try {
      const res = await this.db.read({
        table: 'PaymentLinks',
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getAllPaymentLinks() {
    try {
      const res = await this.db.read({
        table: 'PaymentLinks',
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getPaymentLinksByClientId(clientId: string) {
    try {
      const res = await this.db.read({
        table: 'PaymentLinks',
        data: { linked_client_id: clientId },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }
}

export default PaymentLinkController;
