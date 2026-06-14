import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function assertValidObjectId(value: string, label = 'id') {
  if (!Types.ObjectId.isValid(value)) {
    throw new BadRequestException(`${label} invalido.`);
  }
}
