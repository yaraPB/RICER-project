import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler, type ApiHandlerContext } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';

export const GET = withApiHandler(async (request: Request, context?: ApiHandlerContext) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) throw new AppError(2000);

  const id = context?.params?.id;
  if (!id || typeof id !== 'string') throw new AppError(1000);

  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      report: {
        include: {
          user: {
            select: { cin: true, phone: true, role: true }
          }
        }
      }
    }
  });

  if (!incident) throw new AppError(1002, { message: 'Incident not found' });

  const response = NextResponse.json({ incident });
  response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=5');
  return response;
});

export const PATCH = withApiHandler(async (request: Request, context?: ApiHandlerContext) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) throw new AppError(2000);
  if (currentUser.role !== 'OFFICIAL') throw new AppError(2001);

  const id = context?.params?.id;
  if (!id || typeof id !== 'string') throw new AppError(1000);

  const body = await request.json();
  const { status, severity, description } = body;

  // Validate severity if provided
  if (severity !== undefined && (severity < 1 || severity > 5)) {
    throw new AppError(1001, {
      fields: [{ field: 'severity', code: 'invalid' }],
      message: 'Severity must be between 1 and 5'
    });
  }

  // Validate status if provided
  const validStatuses = ['VIGILANCE', 'ALERTE', 'INTERVENTION', 'MAITRISE', 'ETEINT'];
  if (status !== undefined && !validStatuses.includes(status)) {
    throw new AppError(1001, {
      fields: [{ field: 'status', code: 'invalid' }],
      message: 'Invalid incident status'
    });
  }

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(severity !== undefined && { severity }),
      ...(description !== undefined && { description })
    },
    include: {
      report: {
        include: {
          user: {
            select: { cin: true, phone: true, role: true }
          }
        }
      }
    }
  });

  const response = NextResponse.json({ incident });
  response.headers.set('Cache-Control', 'no-store');
  return response;
});
