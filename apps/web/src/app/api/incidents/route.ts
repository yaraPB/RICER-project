import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { formatValueForError } from '@/lib/errors/context';

export const GET = withApiHandler(async (request: Request) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) throw new AppError(2000);

  const incidents = await prisma.incident.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ incidents });
});

export const POST = withApiHandler(async (request: Request) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) throw new AppError(2000);
  if (currentUser.role !== 'OFFICIAL') throw new AppError(2001);

  const body = await request.json();
  const { reportId, latitude, longitude, cause, severity, status, description } = body;

  // Validate coordinates
  const fields = [];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    fields.push({
      field: 'location',
      code: 'invalid',
      message: `Invalid coordinates: latitude=${formatValueForError(latitude)}, longitude=${formatValueForError(longitude)}`,
    });
  }

  // Validate severity range
  if (!severity || severity < 1 || severity > 5) {
    fields.push({
      field: 'severity',
      code: 'invalid',
      message: `Severity must be between 1 and 5, got: ${formatValueForError(severity)}`,
    });
  }

  if (fields.length) {
    throw new AppError(1001, {
      fields,
      meta: {
        invalidValues: {
          latitude,
          longitude,
          severity,
        },
      },
    });
  }

  // If reportId provided, check it doesn't already have an incident
  if (reportId) {
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, incidentId: true }
    });

    if (!existingReport) {
      throw new AppError(1002, { message: 'Report not found' });
    }

    if (existingReport.incidentId) {
      throw new AppError(1003, { message: 'Report already has an incident' });
    }
  }

  // Create incident and update report in transaction
  const result = await prisma.$transaction(async (tx) => {
    const incident = await tx.incident.create({
      data: {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        cause: cause || 'UNKNOWN',
        severity,
        status: status || 'VIGILANCE',
        description: description || null,
        reportId: reportId || null
      }
    });

    // Update report if reportId provided
    if (reportId) {
      await tx.report.update({
        where: { id: reportId },
        data: {
          incidentId: incident.id,
          status: 'IN_PROGRESS'
        }
      });
    }

    return incident;
  });

  const response = NextResponse.json({ incident: result });
  response.headers.set('Cache-Control', 'no-store');
  return response;
});
