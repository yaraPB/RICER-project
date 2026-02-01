import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';

export const PATCH = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AppError(2000);
  if (currentUser.role !== 'OFFICIAL') throw new AppError(2001);

  const id = params?.id;
  if (!id) throw new AppError(1000);

  let body: { quantity?: unknown; condition?: unknown };
  try {
    body = await request.json();
  } catch (error) {
    throw new AppError(1000, { cause: error });
  }

  const quantity = body.quantity;
  const condition = body.condition;

  if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity))) {
    throw new AppError(1001, { fields: [{ field: 'quantity', code: 'invalid' }] });
  }

  const validConditions = ['Bon', 'Moyen', 'Mauvais'] as const;
  type EquipmentCondition = (typeof validConditions)[number];

  if (condition !== undefined && (typeof condition !== 'string' || !validConditions.includes(condition as EquipmentCondition))) {
    throw new AppError(1001, { fields: [{ field: 'condition', code: 'invalid' }] });
  }

  const updateData: { quantity?: number; condition?: EquipmentCondition } = {};
  if (typeof quantity === 'number') updateData.quantity = quantity;
  if (typeof condition === 'string') updateData.condition = condition as EquipmentCondition;

  const equipment = await prisma.equipment.update({ where: { id }, data: updateData });

  return NextResponse.json({ equipment });
});
