import { NextRequest, NextResponse } from 'next/server';
import { sendRegistrationConfirmationEmail } from '@/lib/email';
import nodemailer from 'nodemailer';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const testRecipient = searchParams.get('to') || process.env.GMAIL_USER || 'alphasciencelabmecbd@gmail.com';

  const gmailUser = process.env.GMAIL_USER || 'alphasciencelabmecbd@gmail.com';
  const rawAppPassword = process.env.GMAIL_APP_PASSWORD || '';
  const appPassword = rawAppPassword.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');

  const diagnostics: Record<string, unknown> = {
    provider: 'Gmail SMTP (App Password)',
    gmailUser,
    appPasswordConfigured: !!appPassword,
    appPasswordLength: appPassword ? appPassword.length : 0,
    appPasswordValidLength: appPassword.length === 16,
    testRecipient,
  };

  // 1. Verify SMTP connection with Gmail
  let smtpVerifyResult = 'not tested';
  if (appPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: appPassword,
        },
      });
      await transporter.verify();
      smtpVerifyResult = 'SUCCESS - Gmail accepted credentials!';
    } catch (err) {
      smtpVerifyResult = `FAILED: ${err instanceof Error ? err.message : String(err)}`;
    }
  } else {
    smtpVerifyResult = 'SKIPPED: GMAIL_APP_PASSWORD is not set in .env.local';
  }
  diagnostics.smtpVerify = smtpVerifyResult;

  // 2. Attempt real email send
  const result = await sendRegistrationConfirmationEmail({
    email: testRecipient,
    name: 'Diagnostic Test User',
    department: 'Software Engineering',
    batch: '2024',
    registrationNumber: 'TEST-001',
    password: 'TestPassword123!',
  });

  return NextResponse.json({
    diagnostics,
    sendResult: result,
  });
}
