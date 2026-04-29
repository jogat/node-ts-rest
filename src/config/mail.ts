export type MailConfig = {
  from: string;
  host?: string;
  port: number;
  secure: boolean;
  username?: string;
  password?: string;
};

export const mailConfig: MailConfig = {
  from: process.env.MAIL_FROM || "Portfolio2025 <no-reply@example.com>",
  host: process.env.MAIL_HOST || undefined,
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_SECURE === "true",
  username: process.env.MAIL_USERNAME || undefined,
  password: process.env.MAIL_PASSWORD || undefined,
};
