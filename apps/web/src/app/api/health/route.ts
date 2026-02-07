import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/errors/withApiHandler';

export const runtime = 'nodejs';

export const GET = withApiHandler(async () => {
  return NextResponse.json({
    ok: true,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
