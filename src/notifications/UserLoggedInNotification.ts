import type { UserRow } from "@models/User";
import type { Notification, NotificationMessage } from "@notifications/Notification";

export class UserLoggedInNotification implements Notification<UserRow> {
  readonly type = "user.logged_in";

  toMessage(user: UserRow): NotificationMessage {
    return {
      subject: "New login",
      body: `A new login was recorded for ${user.email}.`,
      data: {
        user_id: user.id,
      },
    };
  }
}
