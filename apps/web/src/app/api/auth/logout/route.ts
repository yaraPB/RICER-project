import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';

export const POST = withApiHandler(async () => {
  try {
    await clearAuthCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    throw new AppError(5000, { cause: error });
  }
});
