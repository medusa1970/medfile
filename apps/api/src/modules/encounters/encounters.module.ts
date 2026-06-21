import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityModule } from '../security/security.module';
import { TeamModule } from '../team/team.module';
import { Encounter, EncounterSchema } from './encounter.schema';
import { EncountersController } from './encounters.controller';
import { EncountersService } from './encounters.service';

@Module({
  imports: [
    SecurityModule,
    TeamModule,
    MongooseModule.forFeature([{ name: Encounter.name, schema: EncounterSchema }]),
  ],
  controllers: [EncountersController],
  providers: [EncountersService],
})
export class EncountersModule {}
