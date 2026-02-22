import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { DEFAULT_LIMITS } from '@/types/pagination';
import type { OffsetPaginationResponse } from '@/types/pagination';
import { labelOperation } from '@/lib/errors/context';

export const GET = withApiHandler(async (request: Request) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) throw new AppError(2000);
  if (currentUser.role !== 'OFFICIAL') throw new AppError(2001);

  const url = new URL(request.url);
  const type = url.searchParams.get('type'); // 'equipment', 'retardant', 'infrastructure', 'trucks'
  const limit = Math.min(
    parseInt(url.searchParams.get('limit') || String(DEFAULT_LIMITS.EQUIPMENT)),
    200
  );
  const offset = parseInt(url.searchParams.get('offset') || '0');

  // If no specific type requested, return all data arrays
  if (!type) {
    const [equipment, retardantProducts, infrastructure, truckDeployments] = await Promise.all([
      labelOperation(prisma.equipment.findMany({ orderBy: { category: 'asc' } }), 'equipment:find_all_equipment'),
      labelOperation(prisma.retardantProduct.findMany({ orderBy: { productName: 'asc' } }), 'equipment:find_all_retardant'),
      labelOperation(prisma.infrastructure.findMany({ orderBy: { type: 'asc' } }), 'equipment:find_all_infrastructure'),
      labelOperation(prisma.truckDeployment.findMany({ orderBy: { truckName: 'asc' } }), 'equipment:find_all_trucks'),
    ]);

    return NextResponse.json({ equipment, retardantProducts, infrastructure, truckDeployments });
  }

  // Fetch specific type with pagination
  let data: unknown[];
  let total: number;

  switch (type) {
    case 'equipment':
      [data, total] = await Promise.all([
        labelOperation(
          prisma.equipment.findMany({
            skip: offset,
            take: limit,
            orderBy: { category: 'asc' },
          }),
          'equipment:find_equipment'
        ),
        labelOperation(prisma.equipment.count(), 'equipment:count_equipment'),
      ]);
      break;

    case 'retardant':
      [data, total] = await Promise.all([
        labelOperation(
          prisma.retardantProduct.findMany({
            skip: offset,
            take: limit,
            orderBy: { productName: 'asc' },
          }),
          'equipment:find_retardant'
        ),
        labelOperation(prisma.retardantProduct.count(), 'equipment:count_retardant'),
      ]);
      break;

    case 'infrastructure':
      [data, total] = await Promise.all([
        labelOperation(
          prisma.infrastructure.findMany({
            skip: offset,
            take: limit,
            orderBy: { type: 'asc' },
          }),
          'equipment:find_infrastructure'
        ),
        labelOperation(prisma.infrastructure.count(), 'equipment:count_infrastructure'),
      ]);
      break;

    case 'trucks':
      [data, total] = await Promise.all([
        labelOperation(
          prisma.truckDeployment.findMany({
            skip: offset,
            take: limit,
            orderBy: { truckName: 'asc' },
          }),
          'equipment:find_trucks'
        ),
        labelOperation(prisma.truckDeployment.count(), 'equipment:count_trucks'),
      ]);
      break;

    default:
      throw new AppError(1001, {
        fields: [{ field: 'type', code: 'invalid' }],
      });
  }

  const response: OffsetPaginationResponse<typeof data[number]> = {
    data,
    pagination: {
      offset,
      limit,
      total,
      hasMore: offset + limit < total,
    },
  };

  return NextResponse.json(response);
});
