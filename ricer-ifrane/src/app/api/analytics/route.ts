import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Get reports from last 14 days
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

    // Group by date
    const reportsByDate: Record<string, number> = {};
    const reportsByCause: Record<string, number> = {};

    reports.forEach((report) => {
      const date = report.createdAt.toISOString().split('T')[0];
      reportsByDate[date] = (reportsByDate[date] || 0) + 1;

      const cause = report.cause || 'UNKNOWN';
      reportsByCause[cause] = (reportsByCause[cause] || 0) + 1;
    });

    // Fill in missing dates with 0
    const dateArray: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateArray.push({
        date: dateStr,
        count: reportsByDate[dateStr] || 0,
      });
    }

    // Format causes for pie chart
    const causesArray = Object.entries(reportsByCause).map(
      ([cause, count]) => ({
        cause,
        count,
      })
    );

    // Calculate stats
    const totalReports = reports.length;
    const daysWithFires = Object.keys(reportsByDate).length;
    const dailyAverage =
      daysWithFires > 0 ? (totalReports / daysWithFires).toFixed(1) : '0';

    return NextResponse.json({
      timeline: dateArray,
      causes: causesArray,
      stats: {
        totalIncidents: totalReports,
        daysWithFires,
        dailyAverage,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
