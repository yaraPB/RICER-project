import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    if (currentUser.role !== 'OFFICIAL') {
      return NextResponse.json(
        { error: 'هذه العملية متاحة للمسؤولين فقط' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: 'حالة غير صالحة' },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
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
      message: 'تم تحديث حالة التقرير بنجاح',
    });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث التقرير' },
      { status: 500 }
    );
  }
}
