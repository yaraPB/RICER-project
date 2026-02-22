import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { labelOperation } from '@/lib/errors/context';
import { getCachedJSON, cacheJSON } from '@/lib/cache/redis';

const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes
const CACHE_KEY = 'analytics:reports:14d';

export const GET = withApiHandler(async (request: Request) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) throw new AppError(2000);

  // Check cache (Redis or in-memory fallback)
  const cachedData = await getCachedJSON<Record<string, unknown>>(CACHE_KEY);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Use single MongoDB aggregation with $facet for optimal performance
  const result = await labelOperation(
    prisma.report.aggregateRaw({
      pipeline: [
        {
          $match: {
            createdAt: { $gte: { $date: fourteenDaysAgo.toISOString() } },
          },
        },
        {
          $facet: {
            byDate: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                  },
                  count: { $sum: 1 },
                },
              },
              {
                $sort: { _id: 1 },
              },
            ],
            byCause: [
              {
                $group: {
                  _id: { $ifNull: ['$cause', 'UNKNOWN'] },
                  count: { $sum: 1 },
                },
              },
            ],
            totalCount: [
              {
                $count: 'total',
              },
            ],
          },
        },
      ],
    }),
    'analytics:combined_aggregation'
  );

  // Extract results from $facet
  const facetResult = Array.isArray(result) && result.length > 0 ? result[0] : null;
  const byDateResult = facetResult?.byDate || [];
  const byCauseResult = facetResult?.byCause || [];
  const totalCount = facetResult?.totalCount?.[0]?.total || 0;

  // Process date aggregation results
  const reportsByDate: Record<string, number> = {};
  if (Array.isArray(byDateResult)) {
    for (const item of byDateResult as Array<{ _id: string; count: number }>) {
      reportsByDate[item._id] = item.count;
    }
  }

  // Create timeline with all 14 days (fill gaps with 0)
  const timeline: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    timeline.push({ date: dateStr, count: reportsByDate[dateStr] || 0 });
  }

  // Process cause aggregation results
  const causes: { cause: string; count: number }[] = [];
  if (Array.isArray(byCauseResult)) {
    for (const item of byCauseResult as Array<{ _id: string; count: number }>) {
      causes.push({ cause: item._id, count: item.count });
    }
  }

  const daysWithFires = Object.keys(reportsByDate).length;
  const dailyAverage = daysWithFires > 0 ? (totalCount / daysWithFires).toFixed(1) : '0';

  const responseData = {
    timeline,
    causes,
    stats: {
      totalIncidents: totalCount,
      daysWithFires,
      dailyAverage,
    },
  };

  // Update cache (Redis or in-memory fallback)
  await cacheJSON(CACHE_KEY, responseData, CACHE_TTL_SECONDS);

  return NextResponse.json(responseData);
});
