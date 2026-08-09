import "server-only";

import nodemailer from "nodemailer";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
};

const smtpPort = Number(process.env.SMTP_PORT ?? 587);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = (options: SendEmailOptions) => {
  return transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    ...options,
  });
};
