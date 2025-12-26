import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'OFFICIAL') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const [equipment, retardantProducts, infrastructure, trucks] = await Promise.all([
      prisma.equipment.findMany({
        orderBy: { category: 'asc' },
      }),
      prisma.retardantProduct.findMany(),
      prisma.infrastructure.findMany({
        orderBy: { type: 'asc' },
      }),
      prisma.truckDeployment.findMany(),
    ]);

    return NextResponse.json({
      equipment,
      retardantProducts,
      infrastructure,
      trucks,
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء استرجاع المعدات' },
      { status: 500 }
    );
  }
}
