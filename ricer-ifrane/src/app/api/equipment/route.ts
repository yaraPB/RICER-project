import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    if (currentUser.role !== 'OFFICIAL') {
      return NextResponse.json(
        { error: 'هذه الصفحة متاحة للمسؤولين فقط' },
        { status: 403 }
      );
    }

    const [equipment, retardantProducts, infrastructure, truckDeployments] =
      await Promise.all([
        prisma.equipment.findMany({ orderBy: { category: 'asc' } }),
        prisma.retardantProduct.findMany({ orderBy: { productName: 'asc' } }),
        prisma.infrastructure.findMany({ orderBy: { type: 'asc' } }),
        prisma.truckDeployment.findMany({ orderBy: { truckName: 'asc' } }),
      ]);

    return NextResponse.json({
      equipment,
      retardantProducts,
      infrastructure,
      truckDeployments,
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات المعدات' },
      { status: 500 }
    );
  }
}
