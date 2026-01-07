import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cin, phone, password, role, department, position } = body;

    // Validate required fields
    if (!cin || !phone || !password || !role) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { cin },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'المستخدم موجود بالفعل' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        cin,
        phone,
        password: hashedPassword,
        role,
        department: role === 'OFFICIAL' ? department : undefined,
        position: role === 'OFFICIAL' ? position : undefined,
      },
    });

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
      message: 'تم إنشاء الحساب بنجاح',
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // More detailed error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء إنشاء الحساب',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
