import { IsIn } from 'class-validator';
import { normalizePlanCode, type PlanCode } from '@medfile/types';

const ALLOWED_PLAN_CODES = ['free', 'basic', 'professional', 'trial'] as const;

export class SimulateUpgradeDto {
  @IsIn(ALLOWED_PLAN_CODES)
  planCode!: PlanCode | 'trial';

  normalizedPlanCode(): PlanCode {
    return normalizePlanCode(this.planCode);
  }
}
