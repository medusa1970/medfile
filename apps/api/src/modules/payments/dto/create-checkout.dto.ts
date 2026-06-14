import { IsIn, IsOptional } from 'class-validator';
import type { BillingPeriod, PlanCode } from '@medfile/types';

export class CreateCheckoutDto {
  @IsIn(['basic', 'professional'])
  planCode!: PlanCode;

  @IsOptional()
  @IsIn(['monthly', 'quarterly', 'annual'])
  billingPeriod?: BillingPeriod;
}
