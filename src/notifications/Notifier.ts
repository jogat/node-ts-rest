import type { Notification } from "@notifications/Notification";
import type { NotificationChannel } from "@notifications/NotificationChannel";

export class Notifier {
  constructor(private readonly channels: NotificationChannel[] = []) {}

  async send<TNotifiable>(notifiable: TNotifiable, notification: Notification<TNotifiable>): Promise<void> {
    for (const channel of this.channels) {
      await channel.send(notifiable, notification);
    }
  }
}
