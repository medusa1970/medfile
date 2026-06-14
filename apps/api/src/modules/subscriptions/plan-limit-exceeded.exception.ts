import { ForbiddenException } from '@nestjs/common';
import type { PlanCode, PlanLimitResource } from '@medfile/types';

export class PlanLimitExceededException extends ForbiddenException {
  constructor(
    public readonly resource: PlanLimitResource,
    message: string,
    public readonly upgradePlanCode?: PlanCode,
  ) {
    super({
      code: 'PLAN_LIMIT_EXCEEDED',
      resource,
      message,
      upgradePlanCode,
    });
  }
}
