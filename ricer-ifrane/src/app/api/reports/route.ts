import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            cin: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التقارير' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude, description, cause } = body;

    if (!latitude || !longitude || !description) {
      return NextResponse.json(
        { error: 'الموقع والوصف مطلوبان' },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        userId: currentUser.userId,
        latitude,
        longitude,
        description,
        cause,
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

    return NextResponse.json({
      report,
      message: 'تم إرسال التقرير بنجاح',
    });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء التقرير' },
      { status: 500 }
    );
  }
}
