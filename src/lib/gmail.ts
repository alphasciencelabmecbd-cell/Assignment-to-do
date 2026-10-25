/**
 * Gmail Notification Service for Alpha Science Lab
 * Sends automated confirmation emails from Gmail (alphasciencelabmecbd@gmail.com)
 * using a Google Account 16-character App Password via Nodemailer.
 * 
 * Features:
 * - Prominent Alpha Science Lab logo
 * - Task completion incentives & milestone awards
 * - Explicit surprise announcement ("There is a special surprise waiting for you!")
 * - Participant's login credentials (Email, Password, Registration Number)
 * - Direct link & CTA button to the live Vercel competition portal
 * - Dual-format delivery: Rich HTML + Plain-text counterpart for spam-filter deliverability
 */

import nodemailer from 'nodemailer';

export interface SendConfirmationEmailParams {
  email: string;
  name: string;
  department: string;
  batch: string;
  registrationNumber: string;
  password: string;
  portalUrl?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export function buildConfirmationEmailHtml({
  email,
  name,
  department,
  batch,
  registrationNumber,
  password,
  portalUrl,
}: SendConfirmationEmailParams): string {
  const livePortalUrl = portalUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://assignment-to-do.vercel.app';
  const logoUrl = 'https://epqwjnsauwrjlvplkjoa.supabase.co/storage/v1/object/public/asl-submissions/asl-logo.png';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Alpha Science Lab Competition</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #060913;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 620px;
      margin: 24px auto;
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .header {
      background: linear-gradient(135deg, #091224 0%, #0f2744 50%, #082f49 100%);
      padding: 42px 32px 34px 32px;
      text-align: center;
      border-bottom: 1px solid rgba(56, 189, 248, 0.25);
    }
    .logo-container {
      margin-bottom: 18px;
    }
    .logo-container img {
      height: 56px;
      width: auto;
      max-width: 180px;
      display: inline-block;
      filter: drop-shadow(0 4px 14px rgba(6, 182, 212, 0.35));
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.4);
      border-radius: 9999px;
      color: #38bdf8;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      line-height: 1.25;
    }
    .header p {
      margin: 10px 0 0 0;
      color: #94a3b8;
      font-size: 13px;
      letter-spacing: 0.3px;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 15px;
      line-height: 1.65;
      color: #f8fafc;
      margin-bottom: 24px;
    }
    .prize-callout {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 28px;
    }
    .prize-callout h3 {
      margin: 0 0 8px 0;
      color: #38bdf8;
      font-size: 16px;
      font-weight: 800;
    }
    .prize-callout p {
      margin: 0;
      color: #cbd5e1;
      font-size: 13px;
      line-height: 1.65;
    }
    .surprise-box {
      margin-top: 16px;
      padding: 14px 16px;
      background: rgba(234, 179, 8, 0.12);
      border: 1px dashed rgba(234, 179, 8, 0.5);
      border-radius: 12px;
      color: #fef08a;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.5;
    }
    .credentials-card {
      background: #060913;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 28px;
    }
    .credentials-card h4 {
      margin: 0 0 16px 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #38bdf8;
      font-weight: 800;
    }
    .cred-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .cred-table td {
      padding: 9px 0;
      border-bottom: 1px solid #131b2e;
    }
    .cred-table tr:last-child td {
      border-bottom: none;
      padding-bottom: 0;
    }
    .cred-label {
      color: #94a3b8;
      width: 42%;
    }
    .cred-value {
      color: #ffffff;
      font-weight: 700;
      text-align: right;
    }
    .cred-highlight {
      color: #38bdf8 !important;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background: rgba(56, 189, 248, 0.1);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 16px 0;
    }
    .btn {
      display: inline-block;
      padding: 16px 36px;
      background: linear-gradient(135deg, #2563eb 0%, #0284c7 50%, #06b6d4 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 0.3px;
      box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.5);
    }
    .portal-link-text {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 12px;
    }
    .portal-link-text a {
      color: #38bdf8;
      text-decoration: underline;
      font-family: monospace;
    }
    .footer {
      background: #050811;
      border-top: 1px solid #1e293b;
      padding: 24px 32px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    
    <!-- Top Header with Prominently Displayed Alpha Science Lab Logo -->
    <div class="header">
      <div class="logo-container">
        <img src="${logoUrl}" alt="Alpha Science Lab Logo" width="56" height="56" style="height: 56px; width: auto; max-width: 180px; display: inline-block; border: 0;" />
      </div>
      <div class="badge">Official Confirmation</div>
      <h1>Alpha Science Lab</h1>
      <p>National Multi-Stage Technical Innovation Arena</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <p class="greeting">
        Dear <strong>${name}</strong>,<br><br>
        Congratulations! Your individual registration for the <strong>Alpha Science Lab National Competition</strong> has been officially confirmed and recorded in our database. You are now formally registered as an individual competitor.
      </p>

      <!-- Task Completion Incentives & Explicit Surprise Notification -->
      <div class="prize-callout">
        <h3>🏆 Task Completion Incentives & Awards</h3>
        <p>
          Push your engineering limits! We encourage you to <strong>complete and submit deliverables for as many tasks as possible</strong>. Every milestone you complete elevates your standing on the live leaderboard and brings you closer to qualifying for exclusive incentives:
        </p>
        
        <table style="width: 100%; margin-top: 14px; border-spacing: 6px; border-collapse: separate;">
          <tr>
            <td style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 10px 12px; font-size: 12px; color: #e2e8f0; width: 50%;">
              <strong style="color: #38bdf8; display: block; margin-bottom: 2px;">🥇 Grand Finale Qualifiers</strong>
              Top point scorers advance to final jury showcase & cash awards
            </td>
            <td style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 10px 12px; font-size: 12px; color: #e2e8f0; width: 50%;">
              <strong style="color: #38bdf8; display: block; margin-bottom: 2px;">⚡ Fellowship & Mentorship</strong>
              Direct access to industry evaluators & lab resources
            </td>
          </tr>
        </table>

        <div class="surprise-box">
          ✨ <strong>Special Surprise Notice:</strong> There is a <strong>special surprise waiting for you</strong> as you progress through your competition milestones! Complete as many tasks as you can to unlock the mystery rewards prepared for committed competitors.
        </div>
      </div>

      <!-- Credentials Card with Registered Email and Password -->
      <div class="credentials-card">
        <h4>🔐 Your Login Credentials & Access Details</h4>
        <table class="cred-table">
          <tr>
            <td class="cred-label">Participant Name:</td>
            <td class="cred-value">${name}</td>
          </tr>
          <tr>
            <td class="cred-label">Registration Number:</td>
            <td class="cred-value"><span class="cred-highlight">${registrationNumber}</span></td>
          </tr>
          <tr>
            <td class="cred-label">Department:</td>
            <td class="cred-value">${department}</td>
          </tr>
          <tr>
            <td class="cred-label">Batch:</td>
            <td class="cred-value">${batch}</td>
          </tr>
          <tr>
            <td class="cred-label">Registered User-Email:</td>
            <td class="cred-value"><span class="cred-highlight">${email}</span></td>
          </tr>
          <tr>
            <td class="cred-label">Password:</td>
            <td class="cred-value"><span class="cred-highlight">${password}</span></td>
          </tr>
          <tr>
            <td class="cred-label">Live Vercel Portal:</td>
            <td class="cred-value"><a href="${livePortalUrl}" style="color: #38bdf8; text-decoration: none;">${livePortalUrl}</a></td>
          </tr>
        </table>
      </div>

      <!-- Direct Action Button to Live Vercel Portal -->
      <div class="btn-container">
        <a href="${livePortalUrl}" class="btn" target="_blank">Log In to Your Competition Dashboard &rarr;</a>
      </div>
      <div class="portal-link-text">
        Direct portal access: <a href="${livePortalUrl}" target="_blank">${livePortalUrl}</a>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        Alpha Science Lab &bull; MEC Innovation & Robotics Cell<br>
        Please keep this email safe for your login records. If you have any inquiries, contact the contest coordination team.<br>
        &copy; ${new Date().getFullYear()} Alpha Science Lab. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>`;
}

export function buildConfirmationEmailText({
  email,
  name,
  department,
  batch,
  registrationNumber,
  password,
  portalUrl,
}: SendConfirmationEmailParams): string {
  const livePortalUrl = portalUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://assignment-to-do.vercel.app';

  return `Dear ${name},

Congratulations! Your individual registration for the Alpha Science Lab National Competition has been officially confirmed.

--- YOUR LOGIN CREDENTIALS & ACCESS DETAILS ---
Participant Name:     ${name}
Registration Number:  ${registrationNumber}
Department:           ${department}
Batch:                ${batch}
Registered Email:     ${email}
Password:             ${password}
Live Portal Link:     ${livePortalUrl}

--- TASK COMPLETION INCENTIVES & AWARDS ---
Push your engineering limits! We encourage you to complete and submit deliverables for as many tasks as possible.
Every milestone you complete elevates your standing on the live leaderboard and brings you closer to qualifying for exclusive incentives:
- Grand Finale Qualifiers: Top point scorers advance to the final jury showcase & cash awards.
- Fellowship & Mentorship: Direct access to industry evaluators & lab resources.

SPECIAL SURPRISE NOTICE:
There is a special surprise waiting for you as you progress through your competition milestones! Complete as many tasks as you can to unlock the mystery rewards prepared for committed competitors.

Direct Portal Access:
${livePortalUrl}

Best regards,
Alpha Science Lab Coordination Team
MEC Innovation & Robotics Cell`;
}

/**
 * Dispatch confirmation email directly via Gmail SMTP / App Password
 */
export async function sendRegistrationConfirmationEmail(
  params: SendConfirmationEmailParams
): Promise<EmailSendResult> {
  const gmailUser = (
    process.env.GMAIL_USER ||
    process.env.BREVO_SENDER_EMAIL ||
    'alphasciencelabmecbd@gmail.com'
  ).trim();

  // Clean 16-character Google App Password (handles spaces and quotes gracefully)
  const rawAppPassword = process.env.GMAIL_APP_PASSWORD || '';
  const appPassword = rawAppPassword.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
  const senderName = (process.env.GMAIL_SENDER_NAME || 'Alpha Science Lab').trim().replace(/_/g, ' ');

  if (!appPassword) {
    const errorMsg = 'GMAIL_APP_PASSWORD is not configured in .env.local';
    console.warn(`[Gmail] ${errorMsg}. Cannot dispatch confirmation email.`);
    return {
      success: false,
      simulated: true,
      error: errorMsg,
      messageId: `simulated-${Date.now()}`,
    };
  }

  const cleanRecipientEmail = params.email.trim().toLowerCase();
  const cleanRecipientName = (params.name || '').replace(/[<>"']/g, '').trim();
  const cleanSenderName = senderName.replace(/[<>"']/g, '').trim();

  const htmlContent = buildConfirmationEmailHtml({
    ...params,
    email: cleanRecipientEmail,
  });

  const textContent = buildConfirmationEmailText({
    ...params,
    email: cleanRecipientEmail,
  });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: appPassword,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const info = await transporter.sendMail({
      from: `"${cleanSenderName}" <${gmailUser}>`,
      to: cleanRecipientName ? `"${cleanRecipientName}" <${cleanRecipientEmail}>` : cleanRecipientEmail,
      replyTo: `"${cleanSenderName}" <${gmailUser}>`,
      subject: `Welcome to Alpha Science Lab! Registration Confirmed [${params.registrationNumber}]`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[Gmail] Confirmation email successfully delivered to ${cleanRecipientEmail}. Message ID: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Gmail] Delivery error to ${cleanRecipientEmail}:`, errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}
