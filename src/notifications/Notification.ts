export type NotificationMessage = {
  subject: string;
  body: string;
  data?: Record<string, unknown>;
};

export interface Notification<TNotifiable = unknown> {
  readonly type: string;
  toMessage(notifiable: TNotifiable): NotificationMessage;
}
