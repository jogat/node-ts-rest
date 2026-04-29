import type { Notification } from "@notifications/Notification";

export interface NotificationChannel {
  readonly name: string;
  send<TNotifiable>(notifiable: TNotifiable, notification: Notification<TNotifiable>): void | Promise<void>;
}
