import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { formatValueForError } from '@/lib/errors/context';

export const PATCH = withApiHandler(async (request: Request, context) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) throw new AppError(2000);
  if (currentUser.role !== 'OFFICIAL') throw new AppError(2001);

  const id = context?.params?.id;
  if (!id) throw new AppError(1000);

  let body: { quantity?: unknown; condition?: unknown };
  try {
    body = await request.json();
  } catch (error) {
    throw new AppError(1000, { cause: error });
  }

  const quantity = body.quantity;
  const condition = body.condition;

  const validConditions = ['Bon', 'Moyen', 'Mauvais'] as const;
  type EquipmentCondition = (typeof validConditions)[number];

  const fields = [];

  if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity))) {
    fields.push({
      field: 'quantity',
      code: 'invalid',
      message: `Quantity must be a non-negative integer, got: ${formatValueForError(quantity)}`,
    });
  }

  if (condition !== undefined && (typeof condition !== 'string' || !validConditions.includes(condition as EquipmentCondition))) {
    fields.push({
      field: 'condition',
      code: 'invalid',
      message: `Condition must be one of ${validConditions.join(', ')}, got: ${formatValueForError(condition)}`,
    });
  }

  if (fields.length) {
    throw new AppError(1001, {
      fields,
      meta: {
        invalidValues: {
          quantity,
          condition,
        },
      },
    });
  }

  const updateData: { quantity?: number; condition?: EquipmentCondition } = {};
  if (typeof quantity === 'number') updateData.quantity = quantity;
  if (typeof condition === 'string') updateData.condition = condition as EquipmentCondition;

  const equipment = await prisma.equipment.update({ where: { id }, data: updateData });

  return NextResponse.json({ equipment });
});
