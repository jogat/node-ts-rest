import { describe, expect, it, vi } from "vitest";
import { createQueueWorker } from "@queue";
import { JobRegistry } from "@jobs/JobRegistry";

describe("Queue worker", () => {
  it("creates a BullMQ worker with configured queue settings", () => {
    const registry = new JobRegistry();
    const WorkerClass = vi.fn().mockImplementation(() => ({
      close: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    }));

    createQueueWorker({
      queueName: "emails",
      connection: {
        host: "127.0.0.1",
        port: 6379,
      },
      concurrency: 5,
      registry,
      WorkerClass,
    });

    expect(WorkerClass).toHaveBeenCalledWith("emails", expect.any(Function), {
      connection: {
        host: "127.0.0.1",
        port: 6379,
      },
      concurrency: 5,
    });
  });

  it("routes jobs through the registered job handlers", async () => {
    const registry = new JobRegistry();
    const handler = {
      handle: vi.fn().mockResolvedValue(undefined),
    };
    let processor: ((job: { name: string; data: unknown }) => Promise<void>) | undefined;
    const WorkerClass = vi.fn().mockImplementation((_queueName, jobProcessor) => {
      processor = jobProcessor;

      return {
        close: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
      };
    });

    registry.register("mail.send", handler);

    createQueueWorker({
      registry,
      WorkerClass,
    });

    await processor?.({
      name: "mail.send",
      data: {
        subject: "Hello",
      },
    });

    expect(handler.handle).toHaveBeenCalledWith({
      subject: "Hello",
    });
  });

  it("registers completion and failure logging hooks", () => {
    const registry = new JobRegistry();
    const on = vi.fn();
    const WorkerClass = vi.fn().mockImplementation(() => ({
      close: vi.fn().mockResolvedValue(undefined),
      on,
    }));

    createQueueWorker({
      registry,
      WorkerClass,
    });

    expect(on).toHaveBeenCalledWith("completed", expect.any(Function));
    expect(on).toHaveBeenCalledWith("failed", expect.any(Function));
  });
});
