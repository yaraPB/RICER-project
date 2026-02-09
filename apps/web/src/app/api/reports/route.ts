import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { enqueueNotification } from '@/lib/notifications/queue';
import { isTwilioConfigured } from '@/lib/notifications/twilio';
import { DEFAULT_LIMITS } from '@/types/pagination';
import type { CursorPaginationResponse } from '@/types/pagination';
import { formatValueForError } from '@/lib/errors/context';
import { logger } from '@/lib/observability/logger';

export const GET = withApiHandler(async (request: Request) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) throw new AppError(2000);

  const url = new URL(request.url);
  const limit = Math.min(
    parseInt(url.searchParams.get('limit') || String(DEFAULT_LIMITS.REPORTS)),
    100
  );
  const cursor = url.searchParams.get('cursor') || undefined;
  const withoutIncident = url.searchParams.get('withoutIncident') === 'true';

  // Build query
  const where: Prisma.ReportWhereInput = {};
  if (cursor) {
    where.id = { lt: cursor };
  }
  if (withoutIncident) {
    where.incidentId = null;
  }

  // Fetch one extra to determine if there are more results
  const reports = await prisma.report.findMany({
    where,
    take: limit + 1,
    include: {
      user: {
        select: {
          cin: true,
          phone: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get total count (cached for 1 minute in production)
  const total = await prisma.report.count();

  // Determine if there are more results
  const hasMore = reports.length > limit;
  const data = hasMore ? reports.slice(0, limit) : reports;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  const response: CursorPaginationResponse<typeof data[number]> = {
    data,
    pagination: {
      cursor: nextCursor,
      hasMore,
      total,
    },
  };

  return NextResponse.json(response);
});

export const POST = withApiHandler(async (request: Request) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) throw new AppError(2000);

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    throw new AppError(1000, { cause: error });
  }

  const latitudeRaw = (body as { latitude?: unknown })?.latitude;
  const longitudeRaw = (body as { longitude?: unknown })?.longitude;
  const description = typeof (body as { description?: unknown })?.description === 'string' ? (body as { description: string }).description.trim() : '';
  const cause = typeof (body as { cause?: unknown })?.cause === 'string' ? (body as { cause: string }).cause : undefined;

  const fields = [];
  const latitude = typeof latitudeRaw === 'number' ? latitudeRaw : Number(latitudeRaw);
  const longitude = typeof longitudeRaw === 'number' ? longitudeRaw : Number(longitudeRaw);

  if (!Number.isFinite(latitude)) {
    fields.push({
      field: 'latitude',
      code: typeof latitudeRaw === 'undefined' ? 'required' : 'invalid_number',
      message: typeof latitudeRaw !== 'undefined'
        ? `Expected number, got: ${formatValueForError(latitudeRaw)}`
        : undefined,
    });
  }

  if (!Number.isFinite(longitude)) {
    fields.push({
      field: 'longitude',
      code: typeof longitudeRaw === 'undefined' ? 'required' : 'invalid_number',
      message: typeof longitudeRaw !== 'undefined'
        ? `Expected number, got: ${formatValueForError(longitudeRaw)}`
        : undefined,
    });
  }

  if (!description) {
    fields.push({ field: 'description', code: 'required' });
  }

  if (fields.length) {
    throw new AppError(1001, {
      fields,
      meta: {
        invalidValues: {
          latitude: latitudeRaw,
          longitude: longitudeRaw,
          description,
        },
      },
    });
  }

  const report: ReportWithUser = await prisma.report.create({
    data: {
      userId: currentUser.userId,
      latitude,
      longitude,
      description,
      cause,
      images: [],
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          cin: true,
          phone: true,
          role: true,
        },
      },
    },
  });

  // Enqueue notification for background processing (non-blocking)
  if (isTwilioConfigured()) {
    try {
      await enqueueWhatsAppNotification(report);
    } catch (error) {
      logger.error({
        event: 'notification_enqueue_failed',
        meta: {
          reportId: report.id,
          nonBlocking: true,
        },
        error: {
          name: (error as Error)?.name,
          message: (error as Error)?.message,
          stack: (error as Error)?.stack,
        },
      });
    }
  }

  return NextResponse.json({ report });
});

type ReportWithUser = Prisma.ReportGetPayload<{
  include: {
    user: {
      select: {
        cin: true;
        phone: true;
        role: true;
      };
    };
  };
}>;

async function enqueueWhatsAppNotification(report: ReportWithUser): Promise<void> {
  const testPhone = process.env.TEST_PHONE_NUMBER;

  // Get officials
  const officials = await prisma.user.findMany({
    where: { role: 'OFFICIAL' },
    select: { phone: true },
  });

  let recipients = officials
    .map((o) => `whatsapp:${o.phone}`)
    .filter((p) => p.includes('+'));

  // If no officials, use test phone
  if (recipients.length === 0 && testPhone && testPhone !== '+212XXXXXXXXX') {
    recipients = [`whatsapp:${testPhone}`];
    console.log('No officials, using test number:', testPhone);
  }

  if (recipients.length === 0) {
    console.log('No recipients to send to');
    return;
  }

  const googleMapsLink = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;

  const message = `*ALERTE INCENDIE - RICER Ifrane*

*Localisation:*
${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}
Voir sur Google Maps: ${googleMapsLink}

*Description:*
${report.description}

*Signalé par:* ${report.user.cin}
*Date:* ${new Date(report.createdAt).toLocaleString('fr-FR')}

ID: ${report.id}

*Action requise immédiatement*`;

  // Enqueue the notification job
  await enqueueNotification(report.id, recipients, message);
  console.log(`Notification enqueued for ${recipients.length} recipient(s)`);
}
