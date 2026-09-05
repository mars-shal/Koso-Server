import { Database } from '../model/database';
import { logger } from '../utils/logger';

export interface Document {
  id?: string;
  clientId: string;
  projectId?: string;
  name: string;
  type: 'NDA' | 'Agreement' | 'PRD' | 'Terms' | 'Receipt' | 'Other';
  signed: 'Signed' | 'Pending' | 'N/A';
  fileUrl?: string;
}

class DocumentController {
  private db: Database = new Database();

  public async createDocument(document: Document) {
    try {
      const res = await this.db.insert({
        table: 'Documents',
        data: {
          client_id: document.clientId,
          project_id: document.projectId,
          name: document.name,
          type: document.type,
          signed: document.signed,
          file_url: document.fileUrl,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async updateDocument(document: Document) {
    try {
      const res = await this.db.insert({
        table: 'Documents',
        data: {
          id: document.id,
          client_id: document.clientId,
          project_id: document.projectId,
          name: document.name,
          type: document.type,
          signed: document.signed,
          file_url: document.fileUrl,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async deleteDocument(document: Document) {
    try {
      const res = await this.db.delete({
        table: 'Documents',
        data: {
          id: document.id,
        },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getDocument(document: Document) {
    try {
      const res = await this.db.read({
        table: 'Documents',
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getAllDocuments() {
    try {
      const res = await this.db.read({
        table: 'Documents',
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  public async getDocumentsByClientId(clientId: string) {
    try {
      const res = await this.db.read({
        table: 'Documents',
        data: { client_id: clientId },
      });
      return res;
    } catch (error) {
      logger.error(`${error}`);
    }
  }
}

export default DocumentController;
