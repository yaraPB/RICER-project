import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error('Get incidents error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء استرجاع الحوادث' },
      { status: 500 }
    );
  }
}
