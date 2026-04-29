import type { UserRow } from "@models/User";
import type { DomainEvent } from "@events/DomainEvent";

export class UserRegistered implements DomainEvent {
  readonly name = "user.registered";
  readonly occurredAt = new Date();

  constructor(readonly user: UserRow) {}
}
