import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cin, password } = body;

    // Validate required fields
    if (!cin || !password) {
      return NextResponse.json(
        { error: 'رقم البطاقة الوطنية وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { cin },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'رقم البطاقة الوطنية أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'رقم البطاقة الوطنية أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = signToken({
      userId: user.id,
      cin: user.cin,
      role: user.role,
      department: user.department,
    });

    // Set cookie
    await setAuthCookie(token);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'تم تسجيل الدخول بنجاح',
    });
  } catch (error) {
    console.error('Signin error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء تسجيل الدخول',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
