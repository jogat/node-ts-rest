import type { Notification, NotificationMessage } from "@notifications/Notification";
import type { NotificationChannel } from "@notifications/NotificationChannel";

export type NotificationDelivery<TNotifiable = unknown> = {
  channel: string;
  notifiable: TNotifiable;
  type: string;
  message: NotificationMessage;
  sentAt: Date;
};

export class InMemoryNotificationChannel implements NotificationChannel {
  readonly name = "memory";
  private deliveries: NotificationDelivery[] = [];

  send<TNotifiable>(notifiable: TNotifiable, notification: Notification<TNotifiable>): void {
    this.deliveries.push({
      channel: this.name,
      notifiable,
      type: notification.type,
      message: notification.toMessage(notifiable),
      sentAt: new Date(),
    });
  }

  all(): NotificationDelivery[] {
    return [...this.deliveries];
  }

  clear(): void {
    this.deliveries = [];
  }
}
