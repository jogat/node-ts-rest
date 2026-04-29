import type { UserLoggedIn } from "@events/UserLoggedIn";
import type { Listener } from "@listeners/Listener";
import { Notifier, UserLoggedInNotification } from "@notifications";

export class SendUserLoggedInNotification implements Listener<UserLoggedIn> {
  constructor(private readonly notifier: Notifier) {}

  handle(event: UserLoggedIn): Promise<void> {
    return this.notifier.send(event.user, new UserLoggedInNotification());
  }
}
