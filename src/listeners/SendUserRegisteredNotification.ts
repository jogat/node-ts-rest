import type { UserRegistered } from "@events/UserRegistered";
import type { Listener } from "@listeners/Listener";
import { Notifier, UserRegisteredNotification } from "@notifications";

export class SendUserRegisteredNotification implements Listener<UserRegistered> {
  constructor(private readonly notifier: Notifier) {}

  handle(event: UserRegistered): Promise<void> {
    return this.notifier.send(event.user, new UserRegisteredNotification());
  }
}
