import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type { BillingPeriod, PlanCode } from '@medfile/types';

export class ConfirmMockCheckoutDto {
  @IsString()
  @MinLength(8)
  preapprovalId!: string;

  @IsIn(['basic', 'professional'])
  planCode!: PlanCode;

  @IsOptional()
  @IsIn(['monthly', 'quarterly', 'annual'])
  billingPeriod?: BillingPeriod;
}
