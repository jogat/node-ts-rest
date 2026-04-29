import type { PostCreated } from "@events/PostCreated";
import type { PostUpdated } from "@events/PostUpdated";
import type { Listener } from "@listeners/Listener";
import { Notifier, PostChangedNotification } from "@notifications";

export class SendPostCreatedNotification implements Listener<PostCreated> {
  constructor(private readonly notifier: Notifier) {}

  handle(event: PostCreated): Promise<void> {
    return this.notifier.send(event.user, new PostChangedNotification(event.post, "created"));
  }
}

export class SendPostUpdatedNotification implements Listener<PostUpdated> {
  constructor(private readonly notifier: Notifier) {}

  handle(event: PostUpdated): Promise<void> {
    return this.notifier.send({ id: Number(event.post.user_id) }, new PostChangedNotification(event.post, "updated"));
  }
}
