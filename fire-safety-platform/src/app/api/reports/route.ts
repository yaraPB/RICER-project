import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            cin: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء استرجاع التقارير' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude, description, cause } = body;

    if (!latitude || !longitude || !description) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        userId: authUser.userId,
        latitude,
        longitude,
        description,
        cause: cause || null,
        images: [],
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            cin: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    // TODO: Send WhatsApp notification here when Twilio is configured
    // await sendWhatsAppNotification(report);

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء التقرير' },
      { status: 500 }
    );
  }
}
