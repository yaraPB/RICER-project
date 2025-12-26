import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cin, phone, password, role, department, position } = body;

    if (!cin || !phone || !password || !role) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { cin },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'مستخدم بهذا الرقم الوطني موجود بالفعل' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        cin,
        phone,
        password: hashedPassword,
        role,
        department: role === 'OFFICIAL' ? department : null,
        position: role === 'OFFICIAL' ? position : null,
      },
    });

    const token = generateToken({
      userId: user.id,
      cin: user.cin,
      role: user.role,
      department: user.department || undefined,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        cin: user.cin,
        phone: user.phone,
        role: user.role,
        department: user.department,
        position: user.position,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    );
  }
}
