import type { UserRow } from "@models/User";
import type { DomainEvent } from "@events/DomainEvent";

export class UserLoggedIn implements DomainEvent {
  readonly name = "user.logged_in";
  readonly occurredAt = new Date();

  constructor(readonly user: UserRow) {}
}
