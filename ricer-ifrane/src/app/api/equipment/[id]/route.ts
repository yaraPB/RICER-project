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
    const { quantity, condition } = body;

    // Validate inputs
    if (quantity !== undefined && (quantity < 0 || !Number.isInteger(quantity))) {
      return NextResponse.json(
        { error: 'الكمية غير صالحة' },
        { status: 400 }
      );
    }

    if (condition && !['Bon', 'Moyen', 'Mauvais'].includes(condition)) {
      return NextResponse.json(
        { error: 'الحالة غير صالحة' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (condition) updateData.condition = condition;

    const equipment = await prisma.equipment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      equipment,
      message: 'تم تحديث المعدات بنجاح',
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المعدات' },
      { status: 500 }
    );
  }
}
