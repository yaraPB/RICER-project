import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'OFFICIAL') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'الحالة مطلوبة' },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id: params.id },
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

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث التقرير' },
      { status: 500 }
    );
  }
}
