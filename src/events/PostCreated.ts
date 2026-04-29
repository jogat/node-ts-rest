import type { PostRow } from "@models/Post";
import type { UserRow } from "@models/User";
import type { DomainEvent } from "@events/DomainEvent";

export class PostCreated implements DomainEvent {
  readonly name = "post.created";
  readonly occurredAt = new Date();

  constructor(
    readonly post: PostRow,
    readonly user: UserRow
  ) {}
}
