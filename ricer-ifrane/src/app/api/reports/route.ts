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

    console.log('🔥 Report created:', report.id);

    // Try to send WhatsApp - won't crash if it fails
    try {
      await sendWhatsAppNotifications(report);
    } catch (error) {
      console.error('WhatsApp error (non-blocking):', error);
    }

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

async function sendWhatsAppNotifications(report: any) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER;
  const testPhone = process.env.TEST_PHONE_NUMBER;

  if (!accountSid || !authToken || !whatsappFrom) {
    console.log('⚠️  Twilio not configured');
    return;
  }

  console.log('📱 Twilio configured, attempting to send...');

  const twilio = require('twilio');
  const client = twilio(accountSid, authToken);

  // Get officials
  const officials = await prisma.user.findMany({
    where: { role: 'OFFICIAL' },
    select: { phone: true },
  });

  let recipients = officials
    .map((o) => `whatsapp:${o.phone}`)
    .filter((p) => p.includes('+'));

  // If no officials, use test phone
  if (recipients.length === 0 && testPhone && testPhone !== '+212XXXXXXXXX') {
    recipients = [`whatsapp:${testPhone}`];
    console.log('📞 No officials, using test number:', testPhone);
  }

  if (recipients.length === 0) {
    console.log('⚠️  No recipients to send to');
    return;
  }

  const googleMapsLink = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
  
  const message = `🔥 *ALERTE INCENDIE - RICER Ifrane*

📍 *Localisation:*
${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}
Voir sur Google Maps: ${googleMapsLink}

📝 *Description:*
${report.description}

👤 *Signalé par:* ${report.user.cin}
🕐 *Date:* ${new Date(report.createdAt).toLocaleString('fr-FR')}

🆔 ID: ${report.id}

⚠️ *Action requise immédiatement*`;

  console.log(`📨 Sending to ${recipients.length} recipient(s)`);

  for (const recipient of recipients) {
    try {
      console.log(`📤 Sending to: ${recipient}`);
      
      const result = await client.messages.create({
        from: whatsappFrom,
        to: recipient,
        body: message,
      });

      console.log(`✅ Sent! SID: ${result.sid}`);
    } catch (error: any) {
      console.error(`❌ Failed to ${recipient}:`, error.message);
      if (error.code) console.error('Error code:', error.code);
    }
    
    await new Promise((r) => setTimeout(r, 1000));
  }
}