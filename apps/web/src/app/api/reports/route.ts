import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import type { Prisma } from '@prisma/client';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';

export const GET = withApiHandler(async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AppError(2000);

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
});

export const POST = withApiHandler(async (request: Request) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AppError(2000);

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    throw new AppError(1000, { cause: error });
  }

  const latitude = (body as { latitude?: unknown })?.latitude;
  const longitude = (body as { longitude?: unknown })?.longitude;
  const description = typeof (body as { description?: unknown })?.description === 'string' ? (body as { description: string }).description.trim() : '';
  const cause = typeof (body as { cause?: unknown })?.cause === 'string' ? (body as { cause: string }).cause : undefined;

  const fields = [];
  if (typeof latitude !== 'number') fields.push({ field: 'latitude', code: 'required' });
  if (typeof longitude !== 'number') fields.push({ field: 'longitude', code: 'required' });
  if (!description) fields.push({ field: 'description', code: 'required' });
  if (fields.length) throw new AppError(1001, { fields });

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

  try {
    await sendWhatsAppNotifications(report);
  } catch (error) {
    console.error('WhatsApp error (non-blocking):', error);
  }

  return NextResponse.json({ report });
});

type ReportWithUser = Prisma.ReportGetPayload<{
  include: {
    user: {
      select: {
        cin: true;
        phone: true;
        role: true;
      };
    };
  };
}>;

async function sendWhatsAppNotifications(report: ReportWithUser) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER;
  const testPhone = process.env.TEST_PHONE_NUMBER;

  if (!accountSid || !authToken || !whatsappFrom) {
    console.log('Twilio not configured');
    return;
  }

  console.log('Twilio configured, attempting to send...');

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
    console.log('No officials, using test number:', testPhone);
  }

  if (recipients.length === 0) {
    console.log('No recipients to send to');
    return;
  }

  const googleMapsLink = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
  
  const message = `*ALERTE INCENDIE - RICER Ifrane*

*Localisation:*
${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}
Voir sur Google Maps: ${googleMapsLink}

*Description:*
${report.description}

*Signalé par:* ${report.user.cin}
*Date:* ${new Date(report.createdAt).toLocaleString('fr-FR')}

ID: ${report.id}

*Action requise immédiatement*`;

  console.log(`Sending to ${recipients.length} recipient(s)`);

  for (const recipient of recipients) {
    try {
      console.log(`Sending to: ${recipient}`);
      
      const result = await client.messages.create({
        from: whatsappFrom,
        to: recipient,
        body: message,
      });

      console.log(`Sent. SID: ${result.sid}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      const anyErr = err;
      console.error(`Failed to ${recipient}:`, anyErr.message);
      const maybeCode = (error && typeof error === 'object' && 'code' in error) ? error.code : undefined;
      if (maybeCode) console.error('Error code:', maybeCode);
    }
    
    await new Promise((r) => setTimeout(r, 1000));
  }
}
