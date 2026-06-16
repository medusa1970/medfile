import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { assertValidObjectId } from '../../common/assert-valid-object-id';
import { serializeDocument, serializeDocuments } from '../../common/serialize-document';
import { CompleteUploadRequestDto } from './dto/complete-upload-request.dto';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { CreateUploadRequestDto } from './dto/create-upload-request.dto';
import { MedicalDocument, MedicalDocumentRecord } from './medical-document.schema';
import { StorageService } from '../storage/storage.service';
import { PlanLimitsService } from '../subscriptions/plan-limits.service';
import { UploadRequest, UploadRequestDocument } from './upload-request.schema';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(MedicalDocument.name)
    private readonly documentModel: Model<MedicalDocumentRecord>,
    @InjectModel(UploadRequest.name)
    private readonly uploadRequestModel: Model<UploadRequestDocument>,
    private readonly storageService: StorageService,
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  async findInboxForTenant(tenantId: string) {
    const documents = await this.documentModel
      .find({ tenantId, status: { $in: ['received', 'pending_review'] } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return serializeDocuments(documents);
  }

  async findForPatient(tenantId: string, patientId: string) {
    assertValidObjectId(patientId, 'patientId');

    const documents = await this.documentModel
      .find({ tenantId, patientId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .exec();

    return serializeDocuments(documents);
  }

  async createUploadRequest(tenantId: string, input: CreateUploadRequestDto) {
    assertValidObjectId(input.patientId, 'patientId');

    await this.planLimitsService.assertCanCreateUploadRequest(tenantId);

    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : this.defaultExpiration();

    const request = await this.uploadRequestModel.create({
      tenantId,
      patientId: input.patientId,
      token: randomUUID(),
      title: input.title,
      instructions: input.instructions,
      status: 'open',
      expiresAt,
    });

    await this.planLimitsService.recordUploadRequestCreated(tenantId);

    return serializeDocument(request.toObject());
  }

  async findUploadRequestByToken(token: string) {
    const request = await this.uploadRequestModel.findOne({ token }).lean().exec();

    if (!request) {
      throw new NotFoundException('Solicitud de subida no encontrada.');
    }

    return serializeDocument(request);
  }

  async completeUploadRequest(token: string, input: CompleteUploadRequestDto) {
    const request = await this.uploadRequestModel.findOne({ token }).exec();

    if (!request) {
      throw new NotFoundException('Solicitud de subida no encontrada.');
    }

    const fileSizeBytes = input.fileSizeBytes ?? 0;
    await this.planLimitsService.assertCanAddStorage(request.tenantId, fileSizeBytes);

    const document = await this.documentModel.create({
      tenantId: request.tenantId,
      patientId: request.patientId,
      name: input.fileName,
      mimeType: input.mimeType,
      storageKey:
        input.storageKey ??
        `pending/${request.tenantId}/${request.patientId}/${randomUUID()}-${input.fileName}`,
      documentType: input.documentType,
      notes: input.notes,
      uploadRequestId: request.id,
      source: 'patient',
      status: 'pending_review',
      fileSizeBytes,
    });

    request.status = 'completed';
    await request.save();

    await this.planLimitsService.recordStorageAdded(request.tenantId, fileSizeBytes);

    return serializeDocument(document.toObject());
  }

  async createUploadUrl(token: string, input: CreateUploadUrlDto) {
    const request = await this.uploadRequestModel.findOne({ token }).lean().exec();

    if (!request) {
      throw new NotFoundException('Solicitud de subida no encontrada.');
    }

    return this.storageService.createDocumentUploadUrl({
      tenantId: request.tenantId,
      patientId: request.patientId,
      fileName: input.fileName,
      mimeType: input.mimeType,
    });
  }

  async createDownloadUrlForDocument(tenantId: string, documentId: string) {
    assertValidObjectId(documentId, 'documentId');

    const document = await this.documentModel.findOne({ _id: documentId, tenantId }).lean().exec();

    if (!document) {
      throw new NotFoundException('Documento no encontrado.');
    }

    return this.storageService.createDocumentDownloadUrl(
      document.storageKey,
      document.mimeType,
      document.name,
    );
  }

  private defaultExpiration() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    return expiresAt;
  }
}
