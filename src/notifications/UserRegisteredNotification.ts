import type { UserRow } from "@models/User";
import type { Notification, NotificationMessage } from "@notifications/Notification";

export class UserRegisteredNotification implements Notification<UserRow> {
  readonly type = "user.registered";

  toMessage(user: UserRow): NotificationMessage {
    return {
      subject: "Welcome to Portfolio2025",
      body: `Welcome, ${user.name}. Your account is ready.`,
      data: {
        user_id: user.id,
        email: user.email,
      },
    };
  }
}
