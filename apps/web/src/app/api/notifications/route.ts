import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import type { Notification, NotificationType } from '@/types';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: Request) => {
  const user = await getCurrentUser(request);
  if (!user) throw new AppError(2000);

  // Build notifications from recent data sources
  const notifications: Notification[] = [];

  try {
    const { prisma } = await import('@/lib/prisma');

    const recentReports = await prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { id: true, description: true, createdAt: true, status: true },
    });

    for (const report of recentReports) {
      notifications.push({
        id: `report-${report.id}`,
        type: 'NEW_REPORT' as NotificationType,
        title: 'New fire report',
        body: report.description?.slice(0, 100) ?? '',
        read: false,
        createdAt: report.createdAt.toISOString(),
        referenceId: report.id,
        referenceUrl: `/reports-list`,
      });
    }

    const recentIncidents = await prisma.incident.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      where: {
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { id: true, status: true, updatedAt: true },
    });

    for (const incident of recentIncidents) {
      notifications.push({
        id: `incident-${incident.id}`,
        type: 'STATUS_CHANGE' as NotificationType,
        title: `Incident status: ${incident.status}`,
        body: `Incident #${incident.id.slice(0, 6)} updated to ${incident.status}`,
        read: false,
        createdAt: incident.updatedAt.toISOString(),
        referenceId: incident.id,
        referenceUrl: `/map?selected=${incident.id}`,
      });
    }
  } catch {
    // If DB is unavailable, return empty
  }

  // Sort by time, newest first
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ notifications: notifications.slice(0, 10) });
});
