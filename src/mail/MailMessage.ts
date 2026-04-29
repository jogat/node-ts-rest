export type MailAddress = string | {
  name?: string;
  address: string;
};

export type MailMessage = {
  to: MailAddress | MailAddress[];
  subject: string;
  text: string;
  html?: string;
  from?: MailAddress;
  metadata?: Record<string, unknown>;
};

export type MailResult = {
  messageId?: string;
  previewUrl?: string | false;
};
