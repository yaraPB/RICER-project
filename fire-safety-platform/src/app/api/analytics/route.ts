import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const incidents = await prisma.incident.findMany({
      where: {
        createdAt: {
          gte: twoWeeksAgo,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group incidents by date
    const incidentsByDate = incidents.reduce((acc, incident) => {
      const date = incident.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by cause
    const causeDistribution = incidents.reduce((acc, incident) => {
      acc[incident.cause] = (acc[incident.cause] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      incidentsByDate,
      causeDistribution,
      totalIncidents: incidents.length,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء استرجاع التحليلات' },
      { status: 500 }
    );
  }
}
