import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';

export const GET = withApiHandler(async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AppError(2000);

  const incidents = await prisma.incident.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ incidents });
});
