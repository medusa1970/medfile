import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityModule } from '../security/security.module';
import { StorageModule } from '../storage/storage.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TeamModule } from '../team/team.module';
import { UploadRequest, UploadRequestSchema } from './upload-request.schema';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { MedicalDocument, MedicalDocumentSchema } from './medical-document.schema';

@Module({
  imports: [
    StorageModule,
    SecurityModule,
    SubscriptionsModule,
    TeamModule,
    MongooseModule.forFeature([
      { name: MedicalDocument.name, schema: MedicalDocumentSchema },
      { name: UploadRequest.name, schema: UploadRequestSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
