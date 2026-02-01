import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';

export const GET = withApiHandler(async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AppError(2000);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const reports = await prisma.report.findMany({
    where: {
      createdAt: {
        gte: fourteenDaysAgo,
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const reportsByDate: Record<string, number> = {};
  const reportsByCause: Record<string, number> = {};

  for (const report of reports) {
    const date = report.createdAt.toISOString().split('T')[0];
    reportsByDate[date] = (reportsByDate[date] || 0) + 1;

    const cause = report.cause || 'UNKNOWN';
    reportsByCause[cause] = (reportsByCause[cause] || 0) + 1;
  }

  const timeline: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    timeline.push({ date: dateStr, count: reportsByDate[dateStr] || 0 });
  }

  const causes = Object.entries(reportsByCause).map(([cause, count]) => ({ cause, count }));
  const totalReports = reports.length;
  const daysWithFires = Object.keys(reportsByDate).length;
  const dailyAverage = daysWithFires > 0 ? (totalReports / daysWithFires).toFixed(1) : '0';

  return NextResponse.json({
    timeline,
    causes,
    stats: {
      totalIncidents: totalReports,
      daysWithFires,
      dailyAverage,
    },
  });
});
