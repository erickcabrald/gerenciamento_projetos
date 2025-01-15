import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envia um e-mail.
 * @param to - Destinatário do e-mail.
 * @param subject - Assunto do e-mail.
 * @param html - Conteúdo do e-mail em HTML.
 */

export async function sendEmail(to: string, subject: string, html: string) {
  return transport.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
}
