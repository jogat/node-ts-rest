import { describe, expect, it } from "vitest";
import { DomainEvent, EventDispatcher } from "@events";
import { QUEUED_EVENT_LISTENER_JOB, QueuedEventListenerJob } from "@jobs";
import { EventListenerRegistry } from "@listeners";
import { FakeQueueDispatcher } from "@queue";

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

  it("queues named listeners through the queue dispatcher", async () => {
    const queue = new FakeQueueDispatcher();
    const dispatcher = new EventDispatcher(queue);

    dispatcher.listenQueued(TestEvent, "test.listener", { attempts: 2 });

    await dispatcher.dispatch(new TestEvent("payload"));

    expect(queue.all()).toEqual([
      {
        name: QUEUED_EVENT_LISTENER_JOB,
        payload: expect.objectContaining({
          eventName: "test.event",
          listenerName: "test.listener",
          event: expect.objectContaining({
            name: "test.event",
            value: "payload",
          }),
        }),
        options: {
          attempts: 2,
        },
      },
    ]);
  });

  it("requires a queue dispatcher before queued listeners can run", async () => {
    const dispatcher = new EventDispatcher();

    dispatcher.listenQueued(TestEvent, "test.listener");

    await expect(dispatcher.dispatch(new TestEvent("payload"))).rejects.toThrow(
      'Cannot queue listener "test.listener" without a queue dispatcher.'
    );
  });

  it("runs queued listener jobs through the listener registry", async () => {
    const registry = new EventListenerRegistry();
    const handled: string[] = [];
    const job = new QueuedEventListenerJob(registry);

    registry.register<TestEvent>("test.listener", (event) => {
      handled.push(event.value);
    });

    await job.handle({
      eventName: "test.event",
      listenerName: "test.listener",
      event: new TestEvent("payload"),
    });

    expect(handled).toEqual(["payload"]);
    expect(registry.names()).toEqual(["test.listener"]);
  });

  it("fails queued listener jobs when the named listener is missing", async () => {
    const registry = new EventListenerRegistry();
    const job = new QueuedEventListenerJob(registry);

    await expect(
      job.handle({
        eventName: "test.event",
        listenerName: "missing.listener",
        event: new TestEvent("payload"),
      })
    ).rejects.toThrow('Queued event listener "missing.listener" is not registered.');
  });
});
