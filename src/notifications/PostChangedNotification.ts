import type { PostRow } from "@models/Post";
import type { Notification, NotificationMessage } from "@notifications/Notification";

export type PostOwnerNotifiable = {
  id: number;
};

export class PostChangedNotification implements Notification<PostOwnerNotifiable> {
  readonly type: string;

  constructor(
    private readonly post: PostRow,
    private readonly action: "created" | "updated"
  ) {
    this.type = `post.${action}`;
  }

  toMessage(notifiable: PostOwnerNotifiable): NotificationMessage {
    return {
      subject: `Post ${this.action}`,
      body: `Post "${this.post.title}" was ${this.action}.`,
      data: {
        user_id: notifiable.id,
        post_id: this.post.id,
        slug: this.post.slug,
      },
    };
  }
}
