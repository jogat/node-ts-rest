import { describe, expect, it, vi } from "vitest";
import { BullMqQueueDispatcher, FakeQueueDispatcher } from "@queue";

describe("Queue dispatchers", () => {
  it("records dispatched jobs with the fake dispatcher", async () => {
    const dispatcher = new FakeQueueDispatcher();

    await dispatcher.dispatch("mail.send", { subject: "Hello" }, { attempts: 2 });

    expect(dispatcher.all()).toEqual([
      {
        name: "mail.send",
        payload: {
          subject: "Hello",
        },
        options: {
          attempts: 2,
        },
      },
    ]);
  });

  it("passes jobs to BullMQ with default and per-dispatch options", async () => {
    const queue = {
      add: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const dispatcher = new BullMqQueueDispatcher(
      "default",
      {
        connection: {
          host: "127.0.0.1",
          port: 6379,
        },
      },
      {
        attempts: 3,
        removeOnComplete: 100,
      },
      queue
    );

    await dispatcher.dispatch("mail.send", { subject: "Hello" }, { delay: 500 });

    expect(queue.add).toHaveBeenCalledWith("mail.send", { subject: "Hello" }, {
      attempts: 3,
      removeOnComplete: 100,
      delay: 500,
    });
  });
});
