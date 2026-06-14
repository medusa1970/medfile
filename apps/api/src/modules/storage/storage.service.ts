import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';

interface CreateUploadUrlInput {
  tenantId: string;
  patientId: string;
  fileName: string;
  mimeType: string;
}

@Injectable()
export class StorageService {
  private readonly bucket: string;
  private readonly client?: S3Client;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('S3_BUCKET', 'medfile-dev');

    const accessKeyId = this.config.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('S3_SECRET_ACCESS_KEY');
    const endpoint = this.config.get<string>('S3_ENDPOINT');

    if (accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: this.config.get<string>('S3_REGION', 'auto'),
        endpoint: endpoint || undefined,
        forcePathStyle: this.config.get<string>('S3_FORCE_PATH_STYLE', 'false') === 'true',
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  async createDocumentUploadUrl(input: CreateUploadUrlInput) {
    const storageKey = this.createStorageKey(input);

    if (!this.client) {
      return {
        mode: 'mock' as const,
        method: 'PUT',
        uploadUrl: `mock://storage/${storageKey}`,
        storageKey,
        headers: {
          'Content-Type': input.mimeType,
        },
        expiresInSeconds: 300,
      };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: input.mimeType,
    });

    return {
      mode: 'presigned' as const,
      method: 'PUT',
      uploadUrl: await getSignedUrl(this.client, command, { expiresIn: 300 }),
      storageKey,
      headers: {
        'Content-Type': input.mimeType,
      },
      expiresInSeconds: 300,
    };
  }

  private createStorageKey(input: CreateUploadUrlInput) {
    const safeFileName = input.fileName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.\-_]+/g, '-')
      .replace(/^-|-$/g, '');

    return [
      'documents',
      input.tenantId,
      input.patientId,
      `${new Date().toISOString().slice(0, 10)}-${randomUUID()}-${safeFileName || 'archivo'}`,
    ].join('/');
  }
}
