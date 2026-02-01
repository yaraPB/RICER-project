import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';

export const GET = withApiHandler(async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AppError(2000);
  if (currentUser.role !== 'OFFICIAL') throw new AppError(2001);

  const [equipment, retardantProducts, infrastructure, truckDeployments] = await Promise.all([
    prisma.equipment.findMany({ orderBy: { category: 'asc' } }),
    prisma.retardantProduct.findMany({ orderBy: { productName: 'asc' } }),
    prisma.infrastructure.findMany({ orderBy: { type: 'asc' } }),
    prisma.truckDeployment.findMany({ orderBy: { truckName: 'asc' } }),
  ]);

  return NextResponse.json({ equipment, retardantProducts, infrastructure, truckDeployments });
});
