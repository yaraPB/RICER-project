import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Get incidents from last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const incidents = await prisma.incident.findMany({
      where: {
        createdAt: {
          gte: fourteenDaysAgo,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const incidentsByDate: Record<string, number> = {};
    const incidentsByCause: Record<string, number> = {};

    incidents.forEach((incident) => {
      const date = incident.createdAt.toISOString().split('T')[0];
      incidentsByDate[date] = (incidentsByDate[date] || 0) + 1;

      incidentsByCause[incident.cause] =
        (incidentsByCause[incident.cause] || 0) + 1;
    });

    // Fill in missing dates with 0
    const dateArray: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateArray.push({
        date: dateStr,
        count: incidentsByDate[dateStr] || 0,
      });
    }

    // Format causes for pie chart
    const causesArray = Object.entries(incidentsByCause).map(
      ([cause, count]) => ({
        cause,
        count,
      })
    );

    // Calculate stats
    const totalIncidents = incidents.length;
    const daysWithFires = Object.keys(incidentsByDate).length;
    const dailyAverage =
      daysWithFires > 0 ? (totalIncidents / daysWithFires).toFixed(1) : '0';

    return NextResponse.json({
      timeline: dateArray,
      causes: causesArray,
      stats: {
        totalIncidents,
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
