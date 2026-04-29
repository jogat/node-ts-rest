import { describe, expect, it } from "vitest";
import { DomainEvent, EventDispatcher } from "@events";

class TestEvent implements DomainEvent {
  readonly name = "test.event";
  readonly occurredAt = new Date();

  constructor(readonly value: string) {}
}

describe("EventDispatcher", () => {
  it("runs registered listeners synchronously in registration order", async () => {
    const dispatcher = new EventDispatcher();
    const handled: string[] = [];

    dispatcher.listen(TestEvent, (event) => {
      handled.push(`first:${event.value}`);
    });
    dispatcher.listen(TestEvent, async (event) => {
      handled.push(`second:${event.value}`);
    });

    await dispatcher.dispatch(new TestEvent("payload"));

    expect(handled).toEqual(["first:payload", "second:payload"]);
  });
});
