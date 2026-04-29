import { SEND_MAIL_JOB } from "@jobs";
import type { Notification } from "@notifications/Notification";
import type { NotificationChannel } from "@notifications/NotificationChannel";
import type { QueueDispatcher } from "@queue";

type EmailableNotifiable = {
  email?: string;
  name?: string;
};

export class QueuedMailNotificationChannel implements NotificationChannel {
  readonly name = "mail";

  constructor(private readonly queue: QueueDispatcher) {}

  async send<TNotifiable>(notifiable: TNotifiable, notification: Notification<TNotifiable>): Promise<void> {
    const emailable = notifiable as EmailableNotifiable;

    if (!emailable.email) {
      return;
    }

    const message = notification.toMessage(notifiable);

    await this.queue.dispatch(SEND_MAIL_JOB, {
      to: emailable.name
        ? {
            name: emailable.name,
            address: emailable.email,
          }
        : emailable.email,
      subject: message.subject,
      text: message.body,
      metadata: {
        notification_type: notification.type,
        ...message.data,
      },
    });
  }
}
