import { supabase } from "../utils/model";
import { DatabaseSchema, StorageSchema } from "../utils/types";
import { logger } from "../utils/logger";



export class Database {
  private supabase = supabase;

  //CRUD operations

  public async insert(schema: DatabaseSchema) {
    try {
      const { table, data } = schema;
      const { error } = await this.supabase.from(table).upsert(data || {});
      if (error) throw error;
    } catch (error) {
      logger.error(`${error}`);
    } finally {
      logger.info("insert operation completed");
    }
  }
  public async delete(schema: DatabaseSchema) {
    try {
      const { table, data } = schema;
      const { error } = await this.supabase.from(table).delete().eq("email", data?.email);
      if (error) throw error;
    } catch (error) {
      logger.error(`${error}`);
    } finally {
      logger.info("delete operation completed");
    }
  }
  public async read(schema: DatabaseSchema) {
    try {
      const { table, data } = schema;
      const { error, data: result } = await this.supabase.from(table).select();
      if (error) throw error;
      return result;
    } catch (error) {
      logger.error(`${error}`);
    } finally {
      logger.info("read operation completed");
    }
  }

  //Storage operations

  public async uploadStorage(schema: StorageSchema) {
    try {
      const { bucket, path, fileData, contentType } = schema;
      if (!fileData) {
        throw new Error("fileData (base64) is required");
      }
      const buffer = Buffer.from(fileData, "base64");
      const { error } = await this.supabase.storage
        .from(bucket)
        .upload(path, buffer, { contentType, upsert: true });
      if (error) throw error;
    } catch (error) {
      logger.error(`${error}`);
    } finally {
      logger.info("storage upload operation completed");
    }
  }

  public async downloadStorage(schema: StorageSchema) {
    try {
      const { bucket, path } = schema;
      const { data, error } = await this.supabase.storage.from(bucket).download(path);
      if (error) throw error;
      const buffer = Buffer.from(await data.arrayBuffer());
      return buffer.toString("base64");
    } catch (error) {
      logger.error(`${error}`);
      return null;
    } finally {
      logger.info("storage download operation completed");
    }
  }

  public async getStorageUrl(schema: StorageSchema) {
    try {
      const { bucket, path } = schema;
      const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
      if (!data.publicUrl) throw new Error("Failed to generate public URL");
      return data.publicUrl;
    } catch (error) {
      logger.error(`${error}`);
      return null;
    } finally {
      logger.info("storage get url operation completed");
    }
  }

  public async deleteStorage(schema: StorageSchema) {
    try {
      const { bucket, path } = schema;
      const { error } = await this.supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
    } catch (error) {
      logger.error(`${error}`);
    } finally {
      logger.info("storage delete operation completed");
    }
  }

  public async listStorage(schema: StorageSchema) {
    try {
      const { bucket, path } = schema;
      const { error, data } = await this.supabase.storage.from(bucket).list(path || "");
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(`${error}`);
      return [];
    } finally {
      logger.info("storage list operation completed");
    }
  }
}
