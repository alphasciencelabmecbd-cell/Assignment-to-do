/**
 * Legacy Brevo service - delegated to Gmail service
 */
export {
  sendRegistrationConfirmationEmail,
  buildConfirmationEmailHtml,
  type SendConfirmationEmailParams,
  type EmailSendResult,
} from './gmail';
