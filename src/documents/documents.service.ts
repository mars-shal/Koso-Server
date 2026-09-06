import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../database/supabase.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { UploadDocumentDto } from './dto/upload-document.dto.js';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  private readonly SIGNED_URL_TTL_SECONDS = 7 * 24 * 60 * 60;

  async upload(dto: UploadDocumentDto) {
    try {
      if (!dto.fileData) {
        throw new BadRequestException('fileData (base64) is required');
      }

      const bucket = dto.bucket || 'Documents';
      const storagePath = this.buildStoragePath(dto);

      const buffer = Buffer.from(dto.fileData, 'base64');
      const { error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, buffer, { contentType: dto.contentType, upsert: true });

      if (error) {
        this.logger.error(`Upload to storage failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      const { data: urlData, error: signError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, this.SIGNED_URL_TTL_SECONDS);

      if (signError || !urlData) {
        this.logger.error(`Sign document URL failed: ${signError?.message}`);
        throw new BadRequestException(signError?.message || 'Failed to sign document URL');
      }
      const fileUrl = urlData.signedUrl;

      const { error: dbError } = await supabase
        .from('documents')
        .upsert({
          client_id: dto.clientId,
          project_id: dto.projectId,
          name: dto.name,
          type: dto.type,
          signed: dto.signed ?? 'N/A',
          file_url: fileUrl,
        });

      if (dbError) {
        this.logger.error(`Save document record failed: ${dbError.message}`);
        throw new BadRequestException(dbError.message);
      }

      this.logger.log(`Document uploaded: ${dto.name}`);
      return { success: true, name: dto.name, fileUrl };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Upload document error: ${error}`);
      throw new BadRequestException('Failed to upload document');
    }
  }

  async create(dto: CreateDocumentDto) {
    try {
      const { error } = await supabase
        .from('documents')
        .upsert({
          client_id: dto.clientId,
          project_id: dto.projectId,
          name: dto.name,
          type: dto.type,
          signed: dto.signed,
          file_url: dto.fileUrl,
        });

      if (error) {
        this.logger.error(`Create document failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Document created: ${dto.name}`);
      return { success: true, name: dto.name };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Create document error: ${error}`);
      throw new BadRequestException('Failed to create document');
    }
  }

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select();

      if (error) {
        this.logger.error(`Fetch documents failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return this.withFreshSignedUrls(data || []);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch documents error: ${error}`);
      throw new BadRequestException('Failed to fetch documents');
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Fetch document failed: ${error.message}`);
        throw new NotFoundException(`Document with id ${id} not found`);
      }

      return { ...data, file_url: await this.refreshSignedUrl(typeof data.file_url === 'string' ? data.file_url : null) };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Fetch document error: ${error}`);
      throw new BadRequestException('Failed to fetch document');
    }
  }

  async findByClientId(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select()
        .eq('client_id', clientId);

      if (error) {
        this.logger.error(`Fetch documents by client failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return this.withFreshSignedUrls(data || []);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch documents by client error: ${error}`);
      throw new BadRequestException('Failed to fetch documents');
    }
  }

  async findByProjectId(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select()
        .eq('project_id', projectId);

      if (error) {
        this.logger.error(`Fetch documents by project failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return this.withFreshSignedUrls(data || []);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch documents by project error: ${error}`);
      throw new BadRequestException('Failed to fetch documents');
    }
  }

  async findByType(type: string) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select()
        .eq('type', type);

      if (error) {
        this.logger.error(`Fetch documents by type failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      return this.withFreshSignedUrls(data || []);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Fetch documents by type error: ${error}`);
      throw new BadRequestException('Failed to fetch documents');
    }
  }

  async update(id: string, dto: UpdateDocumentDto) {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          client_id: dto.clientId,
          project_id: dto.projectId,
          name: dto.name,
          type: dto.type,
          signed: dto.signed,
          file_url: dto.fileUrl,
        })
        .eq('id', id);

      if (error) {
        this.logger.error(`Update document failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Document updated: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Update document error: ${error}`);
      throw new BadRequestException('Failed to update document');
    }
  }

  async remove(id: string) {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error(`Delete document failed: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.logger.log(`Document deleted: ${id}`);
      return { success: true, id };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Delete document error: ${error}`);
      throw new BadRequestException('Failed to delete document');
    }
  }

  private async refreshSignedUrl(fileUrl: string | null): Promise<string | null> {
    if (!fileUrl || !fileUrl.includes('/storage/v1/object/sign/')) return fileUrl;

    const match = fileUrl.match(/\/storage\/v1\/object\/sign\/([^/]+)\/(.+?)\?token=/);
    if (!match) return fileUrl;

    const { data, error } = await supabase.storage
      .from(decodeURIComponent(match[1]))
      .createSignedUrl(decodeURIComponent(match[2]), this.SIGNED_URL_TTL_SECONDS);

    if (error || !data) return fileUrl;
    return data.signedUrl;
  }

  private async withFreshSignedUrls(rows: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
    return Promise.all(
      rows.map(async (row) => {
        const url = row.file_url;
        return { ...row, file_url: await this.refreshSignedUrl(typeof url === 'string' ? url : null) };
      }),
    );
  }

  private buildStoragePath(dto: UploadDocumentDto): string {
    const fileName = (dto.fileName || dto.name).replace(/[^a-zA-Z0-9._-]/g, '-');
    return dto.clientId ? `${dto.clientId}/${fileName}` : fileName;
  }
}
