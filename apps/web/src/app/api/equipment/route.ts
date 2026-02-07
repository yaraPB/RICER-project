import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { DEFAULT_LIMITS } from '@/types/pagination';
import type { OffsetPaginationResponse } from '@/types/pagination';

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

  // If no specific type requested, return summary counts only
  if (!type) {
    const [equipmentCount, retardantCount, infrastructureCount, trucksCount] = await Promise.all([
      prisma.equipment.count(),
      prisma.retardantProduct.count(),
      prisma.infrastructure.count(),
      prisma.truckDeployment.count(),
    ]);

    return NextResponse.json({
      summary: {
        equipment: equipmentCount,
        retardantProducts: retardantCount,
        infrastructure: infrastructureCount,
        truckDeployments: trucksCount,
      },
    });
  }

  // Fetch specific type with pagination
  let data: unknown[];
  let total: number;

  switch (type) {
    case 'equipment':
      [data, total] = await Promise.all([
        prisma.equipment.findMany({
          skip: offset,
          take: limit,
          orderBy: { category: 'asc' },
        }),
        prisma.equipment.count(),
      ]);
      break;

    case 'retardant':
      [data, total] = await Promise.all([
        prisma.retardantProduct.findMany({
          skip: offset,
          take: limit,
          orderBy: { productName: 'asc' },
        }),
        prisma.retardantProduct.count(),
      ]);
      break;

    case 'infrastructure':
      [data, total] = await Promise.all([
        prisma.infrastructure.findMany({
          skip: offset,
          take: limit,
          orderBy: { type: 'asc' },
        }),
        prisma.infrastructure.count(),
      ]);
      break;

    case 'trucks':
      [data, total] = await Promise.all([
        prisma.truckDeployment.findMany({
          skip: offset,
          take: limit,
          orderBy: { truckName: 'asc' },
        }),
        prisma.truckDeployment.count(),
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
