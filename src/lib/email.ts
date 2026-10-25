/**
 * Main Email Service for Alpha Science Lab
 * Points to the Gmail App Password service
 */
export {
  sendRegistrationConfirmationEmail,
  buildConfirmationEmailHtml,
  type SendConfirmationEmailParams,
  type EmailSendResult,
} from './gmail';
