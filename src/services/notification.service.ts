import nodemailer from "nodemailer";
import { env } from "../config/env";

interface NotificationInput {
  email?: string;
  mobile?: string;
  subject: string;
  message: string;
}

const hasSmtp = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass
      }
    })
  : null;

export const notificationService = {
  async send(input: NotificationInput): Promise<void> {
    await Promise.all([this.sendEmail(input), this.sendSms(input)]);
  },

  async sendEmail(input: NotificationInput): Promise<void> {
    if (!input.email) return;

    if (!transporter) {
      console.log(`[EMAIL:dummy] to=${input.email} subject="${input.subject}" message="${input.message}"`);
      return;
    }

    await transporter.sendMail({
      from: env.smtp.from,
      to: input.email,
      subject: input.subject,
      text: input.message
    });
  },

  async sendSms(input: NotificationInput): Promise<void> {
    if (!input.mobile) return;
    console.log(`[SMS:${env.smsProvider}] to=${input.mobile} message="${input.message}"`);
  }
};
