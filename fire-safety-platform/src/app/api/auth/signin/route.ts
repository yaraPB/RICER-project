import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePasswords, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cin, password } = body;

    if (!cin || !password) {
      return NextResponse.json(
        { error: 'رقم البطاقة الوطنية وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { cin },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'رقم البطاقة الوطنية أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const isValid = await comparePasswords(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'رقم البطاقة الوطنية أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

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
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
