// lib/whatsapp.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

interface FireAlert {
  reporterName: string;
  location: string;
  datetime: Date;
  comment?: string;
}

/**
 * Send WhatsApp notification to firefighters in ARABIC
 */
export async function sendFireAlertWhatsApp(alert: FireAlert): Promise<boolean> {
  try {
    // Format message in Arabic
    const message = `🔥 تنبيه حريق عاجل

📍 الموقع: ${alert.location}
👤 المبلّغ: ${alert.reporterName}
📅 التاريخ: ${new Date(alert.datetime).toLocaleString('ar-MA', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}${alert.comment ? `\n💬 التعليق: ${alert.comment}` : ''}

⚠️ يرجى الرد الفوري
🔗 ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/incidents`;

    // Get firefighter phone numbers (comma-separated in env)
    const firefighterPhones = process.env.TWILIO_WHATSAPP_TO?.split(',') || [];
    
    if (firefighterPhones.length === 0) {
      console.warn('⚠️ No firefighter phone numbers configured');
      console.log('📱 WhatsApp message (would send):');
      console.log(message);
      return false;
    }

    // Send to all firefighters
    const results = await Promise.all(
      firefighterPhones.map(async (phone) => {
        try {
          const result = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM!,
            to: `whatsapp:${phone.trim()}`,
            body: message
          });
          
          console.log(`✅ WhatsApp sent to ${phone}: ${result.sid}`);
          return true;
        } catch (error) {
          console.error(`❌ Failed to send to ${phone}:`, error);
          return false;
        }
      })
    );

    const successCount = results.filter(r => r).length;
    console.log(`📊 WhatsApp sent: ${successCount}/${firefighterPhones.length} succeeded`);
    
    return successCount > 0;
  } catch (error) {
    console.error('❌ WhatsApp service error:', error);
    return false;
  }
}

/**
 * Test WhatsApp configuration
 */
export async function testWhatsApp(): Promise<boolean> {
  try {
    await sendFireAlertWhatsApp({
      reporterName: 'اختبار النظام',
      location: 'الرباط',
      datetime: new Date(),
      comment: 'هذه رسالة اختبار من نظام RICER'
    });
    return true;
  } catch (error) {
    console.error('WhatsApp test failed:', error);
    return false;
  }
}
