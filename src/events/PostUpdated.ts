import type { PostRow, UpdatePostData } from "@models/Post";
import type { DomainEvent } from "@events/DomainEvent";

export class PostUpdated implements DomainEvent {
  readonly name = "post.updated";
  readonly occurredAt = new Date();

  constructor(
    readonly post: PostRow,
    readonly previousPost: PostRow,
    readonly changes: UpdatePostData
  ) {}
}
