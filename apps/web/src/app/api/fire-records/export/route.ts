import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { recordsToCSV, recordsToGeoJSON } from '@/lib/fire-records/export';

export const GET = withApiHandler(async (request: Request) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) throw new AppError(2000);
  if (currentUser.role !== 'OFFICIAL') throw new AppError(2001);

  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'csv';
  const status = url.searchParams.get('status') || undefined;
  const alertSource = url.searchParams.get('alertSource') || undefined;
  const dateFrom = url.searchParams.get('dateFrom') || undefined;
  const dateTo = url.searchParams.get('dateTo') || undefined;

  const where: Record<string, unknown> = {};
  if (status) where.recordStatus = status;
  if (alertSource) where.alertSource = alertSource;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(dateTo) }),
    };
  }

  try {
    const records = await prisma.fireEventRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'geojson') {
      const geojson = recordsToGeoJSON(records);
      return new Response(JSON.stringify(geojson), {
        status: 200,
        headers: {
          'Content-Type': 'application/geo+json',
          'Content-Disposition': 'attachment; filename="fire-records.geojson"',
        },
      });
    }

    const csv = recordsToCSV(records);
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="fire-records.csv"',
      },
    });
  } catch (err) {
    throw new AppError(8008, { cause: err });
  }
});
