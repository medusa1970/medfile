import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { serializeDocument } from '../../common/serialize-document';
import { MailService } from '../mail/mail.service';
import { PlanLimitsService } from '../subscriptions/plan-limits.service';
import { TenantsService } from '../tenants/tenants.service';
import { UsersService } from '../users/users.service';
import { AuditService } from './audit.service';
import { AcceptTeamInvitationDto } from './dto/accept-team-invitation.dto';
import { CreateTeamInvitationDto } from './dto/create-team-invitation.dto';
import { TeamInvitation, TeamInvitationDocument } from './team-invitation.schema';

const INVITATION_TTL_DAYS = 7;

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    @InjectModel(TeamInvitation.name)
    private readonly invitationModel: Model<TeamInvitationDocument>,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly planLimitsService: PlanLimitsService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
    private readonly config: ConfigService,
  ) {}

  async listMembers(tenantId: string) {
    const members = await this.usersService.findActiveForTenant(tenantId);
    return members.map((member) => ({
      id: String(member._id),
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      status: member.status,
      emailVerified: member.emailVerified,
      clinicContexts: member.clinicContexts ?? [],
    }));
  }

  async listPendingInvitations(tenantId: string) {
    const invitations = await this.invitationModel
      .find({ tenantId, status: 'pending', expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return invitations.map((invitation) => ({
      id: String(invitation._id),
      email: invitation.email,
      fullName: invitation.fullName,
      role: invitation.role,
      clinicContextIds: invitation.clinicContextIds ?? [],
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
    }));
  }

  listAudit(tenantId: string, limit?: number) {
    return this.auditService.listForTenant(tenantId, limit);
  }

  async createInvitation(
    tenantId: string,
    invitedByUserId: string,
    input: CreateTeamInvitationDto,
  ) {
    const role = input.role ?? 'assistant';
    await this.planLimitsService.assertCanInviteTeamMember(tenantId, role);

    if (role === 'clinical_capture' && (!input.clinicContextIds?.length)) {
      throw new BadRequestException('Asigna al menos una clinica al colaborador de captura.');
    }

    const inviter = await this.usersService.findById(invitedByUserId);
    const inviterName = inviter?.fullName ?? 'Tu medico';

    const email = input.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      if (existingUser.tenantId === tenantId && existingUser.status !== 'disabled') {
        throw new ConflictException('Esta persona ya pertenece a tu equipo.');
      }
      if (existingUser.tenantId !== tenantId) {
        throw new ConflictException(
          'Este correo ya tiene una cuenta Medfile en otro consultorio.',
        );
      }
    }

    const pendingDuplicate = await this.invitationModel
      .findOne({ tenantId, email, status: 'pending', expiresAt: { $gt: new Date() } })
      .lean()
      .exec();

    if (pendingDuplicate) {
      throw new ConflictException('Ya existe una invitacion pendiente para este correo.');
    }

    const token = randomBytes(24).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 86400000);

    const invitation = await this.invitationModel.create({
      tenantId,
      email,
      fullName: input.fullName.trim(),
      role,
      clinicContextIds: input.clinicContextIds ?? [],
      invitedByUserId,
      tokenHash,
      status: 'pending',
      expiresAt,
    });

    const tenant = await this.tenantsService.findById(tenantId);
    const acceptUrl = this.buildAcceptUrl(token);
    const roleLabel = role === 'clinical_capture' ? 'captura clinica' : 'asistente administrativo';

    if (this.mailService.isConfigured()) {
      await this.mailService.sendTeamInvitation({
        to: email,
        inviteeName: input.fullName.trim(),
        clinicName: String(tenant?.name ?? 'Consultorio Medfile'),
        inviterName,
        acceptUrl,
        expiresInDays: INVITATION_TTL_DAYS,
        roleLabel,
      });
    } else {
      this.logger.warn(`Invitacion equipo sin correo configurado para ${email}`);
    }

    await this.auditService.log({
      tenantId,
      userId: invitedByUserId,
      userRole: inviter?.role ?? 'owner',
      action: 'team.invite',
      resourceType: 'team_invitation',
      resourceId: String(invitation._id),
      metadata: { email, role },
    });

    return {
      invitation: serializeDocument(invitation.toObject()),
      acceptUrl: this.isDevEnvironment() ? acceptUrl : undefined,
    };
  }

  async previewInvitation(token: string) {
    const invitation = await this.findPendingInvitation(token);
    const tenant = await this.tenantsService.findById(invitation.tenantId);

    return {
      email: invitation.email,
      fullName: invitation.fullName,
      role: invitation.role,
      clinicName: String(tenant?.name ?? 'Consultorio Medfile'),
      expiresAt: invitation.expiresAt.toISOString(),
    };
  }

  async acceptInvitation(input: AcceptTeamInvitationDto) {
    const invitation = await this.findPendingInvitation(input.token);
    const email = invitation.email.trim().toLowerCase();
    const role = invitation.role ?? 'assistant';

    if (input.fullName.trim().length < 2) {
      throw new BadRequestException('Nombre invalido.');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser && existingUser.tenantId !== invitation.tenantId) {
      throw new ConflictException('Este correo ya pertenece a otra cuenta Medfile.');
    }

    if (existingUser?.tenantId === invitation.tenantId && existingUser.status === 'active') {
      throw new ConflictException('Esta invitacion ya fue aceptada.');
    }

    await this.planLimitsService.assertCanInviteTeamMember(invitation.tenantId, role);

    const passwordHash = await hash(input.password, 12);
    let userId: string;

    if (existingUser?.tenantId === invitation.tenantId) {
      const reactivated = await this.usersService.reactivateTeamMember({
        userId: String(existingUser._id),
        tenantId: invitation.tenantId,
        fullName: input.fullName.trim(),
        passwordHash,
        role,
        clinicContexts: invitation.clinicContextIds ?? [],
      });
      if (!reactivated) {
        throw new ConflictException('No se pudo activar la cuenta existente.');
      }
      userId = String(reactivated._id);
    } else {
      const user = await this.usersService.createTeamMember({
        tenantId: invitation.tenantId,
        fullName: input.fullName.trim(),
        email,
        passwordHash,
        role,
        clinicContexts: invitation.clinicContextIds ?? [],
      });
      userId = String(user._id);
    }

    await this.invitationModel
      .updateOne(
        { _id: invitation._id },
        {
          $set: {
            status: 'accepted',
            acceptedAt: new Date(),
            acceptedUserId: userId,
          },
        },
      )
      .exec();

    await this.auditService.log({
      tenantId: invitation.tenantId,
      userId,
      userRole: role,
      action: 'team.join',
      resourceType: 'user',
      resourceId: userId,
    });

    return {
      accepted: true,
      tenantId: invitation.tenantId,
      email,
      role,
    };
  }

  async revokeMember(tenantId: string, memberId: string, actorUserId: string, actorRole: string) {
    const member = await this.usersService.disableMember(memberId, tenantId);
    if (!member) {
      throw new NotFoundException('Miembro no encontrado.');
    }

    await this.auditService.log({
      tenantId,
      userId: actorUserId,
      userRole: actorRole,
      action: 'team.revoke',
      resourceType: 'user',
      resourceId: memberId,
    });

    return {
      id: String(member._id),
      status: member.status,
    };
  }

  async updateMemberClinicContexts(
    tenantId: string,
    memberId: string,
    clinicContexts: string[],
    actorUserId: string,
    actorRole: string,
  ) {
    const member = await this.usersService.updateClinicContexts(memberId, tenantId, clinicContexts);
    if (!member) {
      throw new NotFoundException('Colaborador de captura no encontrado.');
    }

    await this.auditService.log({
      tenantId,
      userId: actorUserId,
      userRole: actorRole,
      action: 'team.update_clinic_contexts',
      resourceType: 'user',
      resourceId: memberId,
      metadata: { clinicContexts },
    });

    return {
      id: String(member._id),
      clinicContexts: member.clinicContexts ?? [],
    };
  }

  async revokeInvitation(tenantId: string, invitationId: string) {
    const invitation = await this.invitationModel
      .findOneAndUpdate(
        { _id: invitationId, tenantId, status: 'pending' },
        { $set: { status: 'revoked' } },
        { new: true },
      )
      .lean()
      .exec();

    if (!invitation) {
      throw new NotFoundException('Invitacion no encontrada.');
    }

    return { id: String(invitation._id), status: invitation.status };
  }

  private async findPendingInvitation(token: string) {
    const tokenHash = this.hashToken(token);
    const invitation = await this.invitationModel.findOne({ tokenHash }).lean().exec();

    if (!invitation || invitation.status !== 'pending') {
      throw new NotFoundException('Invitacion invalida o expirada.');
    }

    if (invitation.expiresAt.getTime() < Date.now()) {
      await this.invitationModel.updateOne({ _id: invitation._id }, { $set: { status: 'expired' } }).exec();
      throw new NotFoundException('Invitacion expirada.');
    }

    return invitation;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildAcceptUrl(token: string) {
    const webOrigin = (this.config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3100').split(',')[0];
    return `${webOrigin}/equipo/aceptar?token=${encodeURIComponent(token)}`;
  }

  private isDevEnvironment() {
    return (this.config.get<string>('NODE_ENV') ?? 'development') !== 'production';
  }
}
