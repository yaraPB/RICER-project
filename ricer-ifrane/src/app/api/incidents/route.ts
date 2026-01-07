import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error('Get incidents error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الحوادث' },
      { status: 500 }
    );
  }
}
